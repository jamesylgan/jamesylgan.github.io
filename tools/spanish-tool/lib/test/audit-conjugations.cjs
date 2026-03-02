#!/usr/bin/env node
/**
 * Audit script: checks conjugation coverage for the Spanish learning tool.
 * Verifies that all verbs in the lesson vocabulary have conjugation data
 * in conjugationVerbs, and reports which verbs are missing.
 *
 * Usage: node lib/test/audit-conjugations.cjs
 * Run from the spanish-tool directory.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

// ── 1. Load and parse index.html ──────────────────────────────────────────────
const htmlPath = path.join(ROOT, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

// ── 2. Extract the lessons array ──────────────────────────────────────────────
const lessonsMatch = html.match(/const lessons\s*=\s*(\[[\s\S]*?\n    \]);/);
if (!lessonsMatch) { console.error('Could not extract lessons array'); process.exit(1); }
let lessons;
try {
    lessons = eval(lessonsMatch[1]);
} catch (e) {
    console.error('Failed to eval lessons:', e.message);
    process.exit(1);
}

// ── 3. Extract conjugationTypes array ─────────────────────────────────────────
const typesMatch = html.match(/const conjugationTypes\s*=\s*(\[[\s\S]*?\n    \]);/);
if (!typesMatch) { console.error('Could not extract conjugationTypes'); process.exit(1); }
let conjugationTypes;
try {
    conjugationTypes = eval(typesMatch[1]);
} catch (e) {
    console.error('Failed to eval conjugationTypes:', e.message);
    process.exit(1);
}

// ── 4. Extract conjugationVerbs object ────────────────────────────────────────
const verbsMatch = html.match(/const conjugationVerbs\s*=\s*(\{[\s\S]*?\n    \});/);
if (!verbsMatch) { console.error('Could not extract conjugationVerbs'); process.exit(1); }
let conjugationVerbs;
try {
    conjugationVerbs = eval('(' + verbsMatch[1] + ')');
} catch (e) {
    console.error('Failed to eval conjugationVerbs:', e.message);
    process.exit(1);
}

// ── 5. Collect lesson verbs ───────────────────────────────────────────────────
// A word is a verb if it ends in -ar, -er, -ir (including reflexive -arse, -erse, -irse)
// Must be a single word (no spaces) and at least 3 chars to avoid false positives like "ir"
// Also check against known non-verb words ending in -ar/-er/-ir
const nonVerbs = new Set(['ayer', 'lugar', 'mujer', 'bar', 'hogar', 'azucar', 'par']);
function isVerb(word) {
    const w = word.toLowerCase().trim();
    if (w.includes(' ')) return false; // multi-word expressions like "es decir"
    if (nonVerbs.has(w)) return false;
    return /(?:ar|er|ir|arse|erse|irse)$/i.test(w);
}

const lessonVerbs = new Map(); // verb -> [days]
lessons.forEach(lesson => {
    if (!lesson.vocab) return;
    lesson.vocab.forEach(([es]) => {
        if (isVerb(es)) {
            const verb = es.toLowerCase();
            if (!lessonVerbs.has(verb)) lessonVerbs.set(verb, []);
            lessonVerbs.get(verb).push(lesson.day);
        }
    });
});

// ── 6. Collect conjugation verbs ──────────────────────────────────────────────
const conjVerbs = new Map(); // verb -> [typeIds]
Object.entries(conjugationVerbs).forEach(([typeId, verbs]) => {
    verbs.forEach(v => {
        const verb = v.verb.toLowerCase();
        if (!conjVerbs.has(verb)) conjVerbs.set(verb, []);
        conjVerbs.get(verb).push(typeId);
    });
});

// ── 7. Analyze coverage ─────────────────────────────────────────────────────
const covered = [];
const missing = [];

for (const [verb, days] of lessonVerbs) {
    if (conjVerbs.has(verb)) {
        covered.push({ verb, days, types: conjVerbs.get(verb) });
    } else {
        missing.push({ verb, days });
    }
}

// Verbs in conjugation tables but not in lesson vocabulary
const extraVerbs = [];
for (const [verb, types] of conjVerbs) {
    if (!lessonVerbs.has(verb)) {
        extraVerbs.push({ verb, types });
    }
}

// ── 8. Report ────────────────────────────────────────────────────────────────
console.log('='.repeat(80));
console.log('  CONJUGATION COVERAGE AUDIT REPORT');
console.log('  Spanish Learning Tool — Verb Conjugation Data');
console.log('='.repeat(80));
console.log();

// Stats
console.log(`Lesson verbs:       ${lessonVerbs.size}`);
console.log(`Conjugation verbs:  ${conjVerbs.size} (unique infinitives across ${Object.keys(conjugationVerbs).length} types)`);
console.log(`Covered:            ${covered.length}/${lessonVerbs.size} (${(covered.length / lessonVerbs.size * 100).toFixed(1)}%)`);
console.log(`Missing:            ${missing.length}`);
console.log(`Extra (not in lessons): ${extraVerbs.length}`);
console.log();

// Group conjugation types by tense for coverage analysis
const tenseTypes = {};
conjugationTypes.forEach(ct => {
    if (!tenseTypes[ct.tense]) tenseTypes[ct.tense] = [];
    tenseTypes[ct.tense].push(ct.id);
});

// Missing verbs
if (missing.length > 0) {
    console.log('-'.repeat(80));
    console.log('  MISSING — Lesson verbs with NO conjugation data');
    console.log('-'.repeat(80));
    console.log();
    missing.sort((a, b) => a.days[0] - b.days[0]);
    missing.forEach(({ verb, days }) => {
        const type = verb.endsWith('se')
            ? 'reflexive'
            : verb.endsWith('ar') || verb.endsWith('arse') ? '-ar'
            : verb.endsWith('er') || verb.endsWith('erse') ? '-er'
            : '-ir';
        console.log(`  ${verb.padEnd(20)} Day ${days.join(', ').padEnd(12)} (${type})`);
    });
    console.log();
}

// Covered verbs — tense coverage detail
console.log('-'.repeat(80));
console.log('  COVERED VERBS — Tense coverage per verb');
console.log('-'.repeat(80));
console.log();

// Build tense coverage per verb
const tenseNames = [...new Set(conjugationTypes.map(ct => ct.tense))];
const shortTenseNames = {
    present: 'pres', preterite: 'pret', imperfect: 'impf', future: 'futr',
    conditional: 'cond', subjunctive: 'subj',
    present_perfect: 'pp', past_perfect: 'plup', future_perfect: 'fp',
    conditional_perfect: 'cp', subjunctive_imperfect: 'si',
    subjunctive_present_perfect: 'spp', subjunctive_pluperfect: 'spl',
    imperative_affirmative: 'imp+', imperative_negative: 'imp-'
};

// Header
const header = '  ' + 'Verb'.padEnd(20) + tenseNames.map(t => (shortTenseNames[t] || t).padStart(5)).join('');
console.log(header);
console.log('  ' + '-'.repeat(header.length - 2));

covered.sort((a, b) => a.verb.localeCompare(b.verb));
covered.forEach(({ verb, types }) => {
    const row = tenseNames.map(tense => {
        const typeIds = tenseTypes[tense] || [];
        const hasTense = types.some(t => typeIds.includes(t));
        return (hasTense ? 'Y' : '-').padStart(5);
    }).join('');
    console.log(`  ${verb.padEnd(20)}${row}`);
});
console.log();

// Extra verbs (in conjugation tables but not in lessons)
if (extraVerbs.length > 0) {
    console.log('-'.repeat(80));
    console.log('  EXTRA — Verbs in conjugation tables but NOT in lesson vocabulary');
    console.log('-'.repeat(80));
    console.log();
    extraVerbs.forEach(({ verb, types }) => {
        console.log(`  ${verb.padEnd(20)} ${types.join(', ')}`);
    });
    console.log();
}

// Type-level stats
console.log('-'.repeat(80));
console.log('  CONJUGATION TYPE STATS');
console.log('-'.repeat(80));
console.log();
Object.entries(conjugationVerbs).forEach(([typeId, verbs]) => {
    const ct = conjugationTypes.find(t => t.id === typeId);
    const label = ct ? ct.label : typeId;
    console.log(`  ${label.padEnd(35)} ${verbs.length} verbs (unlocks day ${ct ? ct.unlocksAt : '?'})`);
});
console.log();

// Summary
console.log('='.repeat(80));
console.log('  SUMMARY');
console.log('='.repeat(80));
console.log();
if (missing.length === 0) {
    console.log('  ALL lesson verbs have conjugation data.');
} else {
    console.log(`  ${missing.length} lesson verb(s) are MISSING conjugation data.`);
    console.log(`  Missing: ${missing.map(m => m.verb).join(', ')}`);
}
console.log();
console.log('='.repeat(80));

// Exit with error code if there are missing verbs
process.exit(missing.length > 0 ? 1 : 0);
