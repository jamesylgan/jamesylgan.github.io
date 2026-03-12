#!/usr/bin/env node
/**
 * Audit script: tests pure functions extracted from the Task Tracker.
 * Covers helpers (uid, esc, fmtDate, sanitizeHref, parseLinkValue, buildLinkValue),
 * date/repeat logic, and data manipulation functions.
 *
 * Usage: node test/audit-functions.cjs
 * Run from the task-tracker directory.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const htmlPath = path.join(ROOT, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

let passed = 0;
let failed = 0;
function assert(condition, msg) {
    if (condition) { passed++; }
    else { failed++; console.error(`  FAIL: ${msg}`); }
}

// ── Minimal DOM stub for functions that use document ─────────────────────────
global.document = {
    createElement(tag) {
        return {
            _text: '',
            set textContent(v) { this._text = v; },
            get innerHTML() {
                return this._text
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            }
        };
    }
};

// ── Extract script block ────────────────────────────────────────────────────
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) { console.error('Could not extract script'); process.exit(1); }

// ── Build sandbox with pure functions ───────────────────────────────────────
// We extract individual functions that don't depend on DOM

function extractFn(name) {
    // Match function name(args) { ... } accounting for nested braces
    const re = new RegExp(`function ${name}\\s*\\([^)]*\\)\\s*\\{`);
    const m = re.exec(scriptMatch[1]);
    if (!m) return null;
    let depth = 0;
    let start = m.index;
    let i = m.index + m[0].length - 1; // position of opening brace
    for (; i < scriptMatch[1].length; i++) {
        if (scriptMatch[1][i] === '{') depth++;
        else if (scriptMatch[1][i] === '}') { depth--; if (depth === 0) break; }
    }
    return scriptMatch[1].substring(start, i + 1);
}

// ── 1. uid() ────────────────────────────────────────────────────────────────
console.log('\n── uid() ──');
const uidSrc = extractFn('uid');
assert(uidSrc, 'uid function found');
const uid = new Function('prefix', uidSrc + '\nreturn uid(prefix);');
{
    const id1 = uid('t');
    const id2 = uid('t');
    assert(id1.startsWith('t'), `uid('t') starts with 't': ${id1}`);
    assert(id1 !== id2, 'uid generates unique IDs');
    const gid = uid('g');
    assert(gid.startsWith('g'), `uid('g') starts with 'g': ${gid}`);
}

// ── 2. esc() ────────────────────────────────────────────────────────────────
console.log('── esc() ──');
const escSrc = extractFn('esc');
assert(escSrc, 'esc function found');
const esc = new Function('s', escSrc + '\nreturn esc(s);');
{
    assert(esc('hello') === 'hello', 'esc plain text unchanged');
    assert(esc('<b>bold</b>') === '&lt;b&gt;bold&lt;/b&gt;', 'esc escapes HTML tags');
    assert(esc('"quotes"') === '&quot;quotes&quot;', 'esc escapes double quotes');
    assert(esc("it's") === "it&#039;s", 'esc escapes single quotes');
    assert(esc('a & b') === 'a &amp; b', 'esc escapes ampersand');
    assert(esc('') === '', 'esc handles empty string');
}

// ── 3. fmtDate() ────────────────────────────────────────────────────────────
console.log('── fmtDate() ──');
// fmtDate depends on settings.dateFormat, so we build a wrapper
{
    const fmtDateSrc = extractFn('fmtDate');
    assert(fmtDateSrc, 'fmtDate function found');

    function testFmtDate(format, input, expected) {
        const settings = { dateFormat: format };
        const fn = new Function('isoDate', 'settings', fmtDateSrc + '\nreturn fmtDate(isoDate);');
        const result = fn(input, settings);
        assert(result === expected, `fmtDate('${input}', '${format}') = '${result}' (expected '${expected}')`);
    }

    testFmtDate('yyyy-mm-dd', '2026-03-15', '2026-03-15');
    testFmtDate('mm/dd/yyyy', '2026-03-15', '03/15/2026');
    testFmtDate('dd/mm/yyyy', '2026-03-15', '15/03/2026');
    testFmtDate('dd/mm/yyyy', '', '');
}

// ── 4. sanitizeHref() ───────────────────────────────────────────────────────
console.log('── sanitizeHref() ──');
const sanitizeSrc = extractFn('sanitizeHref');
assert(sanitizeSrc, 'sanitizeHref function found');
const sanitizeHref = new Function('url', sanitizeSrc + '\nreturn sanitizeHref(url);');
{
    assert(sanitizeHref('https://example.com') === 'https://example.com', 'sanitize allows https');
    assert(sanitizeHref('http://example.com') === 'http://example.com', 'sanitize allows http');
    assert(sanitizeHref('javascript:alert(1)') === '', 'sanitize blocks javascript: protocol');
    assert(sanitizeHref('  javascript:void(0)  ') === '', 'sanitize blocks javascript: with whitespace');
    assert(sanitizeHref('') === '', 'sanitize handles empty string');
    // Note: sanitizeHref only blocks javascript: protocol, not data:
    assert(sanitizeHref('/relative/path') === '/relative/path', 'sanitize allows relative paths');
}

// ── 5. parseLinkValue() / buildLinkValue() ──────────────────────────────────
console.log('── parseLinkValue / buildLinkValue ──');
const parseSrc = extractFn('parseLinkValue');
const buildSrc = extractFn('buildLinkValue');
assert(parseSrc, 'parseLinkValue function found');
assert(buildSrc, 'buildLinkValue function found');
const parseLinkValue = new Function('val', parseSrc + '\nreturn parseLinkValue(val);');
const buildLinkValue = new Function('url', 'text', buildSrc + '\nreturn buildLinkValue(url, text);');
{
    const r1 = parseLinkValue('https://foo.com|My Link');
    assert(r1.url === 'https://foo.com', 'parse extracts URL');
    assert(r1.text === 'My Link', 'parse extracts text');

    const r2 = parseLinkValue('https://bar.com');
    assert(r2.url === 'https://bar.com', 'parse URL-only');
    assert(r2.text === '', 'parse URL-only has empty text');

    const r3 = parseLinkValue('');
    assert(r3.url === '', 'parse empty returns empty url');

    assert(buildLinkValue('https://foo.com', 'My Link') === 'https://foo.com|My Link', 'build with text');
    assert(buildLinkValue('https://foo.com', '') === 'https://foo.com', 'build without text');

    // Roundtrip
    const built = buildLinkValue('https://x.com', 'Click');
    const parsed = parseLinkValue(built);
    assert(parsed.url === 'https://x.com' && parsed.text === 'Click', 'roundtrip preserves data');
}

// ── 6. formatRepeat() ───────────────────────────────────────────────────────
console.log('── formatRepeat() ──');
const formatRepeatSrc = extractFn('formatRepeat');
assert(formatRepeatSrc, 'formatRepeat function found');
{
    const fn = new Function('task', formatRepeatSrc + '\nreturn formatRepeat(task);');
    assert(fn({}) === '', 'formatRepeat empty task');
    assert(fn({ repeat: '' }) === '', 'formatRepeat no repeat');
    assert(fn({ repeat: 'daily' }) === 'daily', 'formatRepeat daily');
    assert(fn({ repeat: 'weekly' }) === 'weekly', 'formatRepeat weekly');
    assert(fn({ repeat: 'biweekly' }) === 'biweekly', 'formatRepeat biweekly');
    assert(fn({ repeat: 'monthly' }) === 'monthly', 'formatRepeat monthly');
    const withDays = fn({ repeat: 'weekly', repeatDays: [1, 3, 5] });
    assert(withDays.includes('Mo'), 'formatRepeat weekly with days includes Mo');
    assert(withDays.includes('Fr'), 'formatRepeat weekly with days includes Fr');
}

// ── 7. getNextRepeatDate() ──────────────────────────────────────────────────
console.log('── getNextRepeatDate() ──');
const gnrdSrc = extractFn('getNextRepeatDate');
assert(gnrdSrc, 'getNextRepeatDate function found');
{
    const fn = new Function('fromDate', 'repeat', gnrdSrc + '\nreturn getNextRepeatDate(fromDate, repeat);');
    // Helper: compute expected result using same local-to-UTC approach as the function
    function expected(fromDate, addDays) {
        const d = new Date(fromDate + 'T00:00:00');
        d.setDate(d.getDate() + addDays);
        return d.toISOString().split('T')[0];
    }
    function expectedMonth(fromDate, addMonths) {
        const d = new Date(fromDate + 'T00:00:00');
        d.setMonth(d.getMonth() + addMonths);
        return d.toISOString().split('T')[0];
    }
    // Daily: +1 day
    const d1 = fn('2026-03-13', 'daily');
    assert(/^\d{4}-\d{2}-\d{2}$/.test(d1), `daily returns ISO date: ${d1}`);
    assert(d1 === expected('2026-03-13', 1), `daily adds 1 day: ${d1} (expected ${expected('2026-03-13', 1)})`);
    // Weekly: +7 days
    const d2 = fn('2026-03-13', 'weekly');
    assert(d2 === expected('2026-03-13', 7), `weekly adds 7 days: ${d2} (expected ${expected('2026-03-13', 7)})`);
    // Biweekly: +14 days
    const d3 = fn('2026-03-13', 'biweekly');
    assert(d3 === expected('2026-03-13', 14), `biweekly adds 14 days: ${d3} (expected ${expected('2026-03-13', 14)})`);
    // Monthly: moves to next month
    const d4 = fn('2026-01-15', 'monthly');
    assert(d4 === expectedMonth('2026-01-15', 1), `monthly from Jan: ${d4} (expected ${expectedMonth('2026-01-15', 1)})`);
}

// ── 8. darkenHex() ──────────────────────────────────────────────────────────
console.log('── darkenHex() ──');
const darkenSrc = extractFn('darkenHex');
assert(darkenSrc, 'darkenHex function found');
const darkenHex = new Function('hex', 'amount', darkenSrc + '\nreturn darkenHex(hex, amount);');
{
    assert(darkenHex('#ffffff', 0).toLowerCase() === '#ffffff', 'darken 0 = no change');
    const darkened = darkenHex('#ffffff', 50);
    assert(darkened.startsWith('#'), 'darken returns hex color');
    assert(darkened.length === 7, 'darken returns 7-char hex');
    const r = parseInt(darkened.slice(1, 3), 16);
    assert(r < 255, 'darken reduces brightness');
    assert(darkenHex('#000000', 50).toLowerCase() === '#000000', 'darken black stays black');
}

// ── 9. compressImage() ──────────────────────────────────────────────────────
console.log('── compressImage() ──');
// Can't test fully without canvas/Image, but verify function exists and signature
assert(html.includes('function compressImage(file, maxBytes)'), 'compressImage function exists with correct signature');
assert(html.includes("canvas.toDataURL('image/jpeg'"), 'compressImage uses JPEG compression');

// ── 10. Data structure validation ───────────────────────────────────────────
console.log('── DEFAULT_DATA Structure ──');

const defaultDataMatch = html.match(/const DEFAULT_DATA\s*=\s*(\{[\s\S]*?\n\});/);
assert(defaultDataMatch, 'Could not extract DEFAULT_DATA');
let DEFAULT_DATA;
try {
    // uid() is called in DEFAULT_DATA, so provide it
    const uidFn = new Function(uidSrc + '\nreturn uid;')();
    DEFAULT_DATA = new Function('uid', 'return ' + defaultDataMatch[1])(uidFn);
} catch (e) {
    console.error('Failed to eval DEFAULT_DATA:', e.message);
    process.exit(1);
}

assert(Array.isArray(DEFAULT_DATA.groups), 'DEFAULT_DATA.groups is an array');
assert(Array.isArray(DEFAULT_DATA.trash), 'DEFAULT_DATA.trash is an array');
assert(Array.isArray(DEFAULT_DATA.nextTasks), 'DEFAULT_DATA.nextTasks is an array');
assert(typeof DEFAULT_DATA.repeatHistory === 'object', 'DEFAULT_DATA.repeatHistory is an object');

DEFAULT_DATA.groups.forEach((g, i) => {
    assert(g.id, `Group ${i} has id`);
    assert(typeof g.name === 'string', `Group ${i} has name`);
    assert(Array.isArray(g.tasks), `Group ${i} has tasks array`);
    g.tasks.forEach((t, j) => {
        assert(t.id, `Group ${i} task ${j} has id`);
        assert(typeof t.title === 'string', `Group ${i} task ${j} has title`);
        assert(typeof t.done === 'boolean', `Group ${i} task ${j} done is boolean`);
    });
});

// ── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n═══════════════════════════════════════`);
console.log(`  Functions audit: ${passed} passed, ${failed} failed`);
console.log(`═══════════════════════════════════════\n`);

process.exit(failed > 0 ? 1 : 0);
