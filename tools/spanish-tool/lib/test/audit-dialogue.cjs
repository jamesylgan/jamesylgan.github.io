#!/usr/bin/env node
/**
 * Audit script: finds all dialogue words in the Spanish learning tool
 * that cannot be resolved by the word lookup system.
 *
 * Usage: node lib/test/audit-dialogue.cjs
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

// ── 3. Load commonSpanishWords ────────────────────────────────────────────────
const commonWordsPath = path.join(ROOT, 'common-words.js');
const commonWordsCode = fs.readFileSync(commonWordsPath, 'utf-8');
let commonSpanishWords;
try {
    const fn = new Function(commonWordsCode + '\nreturn commonSpanishWords;');
    commonSpanishWords = fn();
} catch (e) {
    console.error('Failed to load common words:', e.message);
    process.exit(1);
}

// ── 4. Extract conjugationVerbs ───────────────────────────────────────────────
const conjMatch = html.match(/const conjugationVerbs\s*=\s*(\{[\s\S]*?\n    \});/);
if (!conjMatch) { console.error('Could not extract conjugationVerbs'); process.exit(1); }
let conjugationVerbs;
try {
    conjugationVerbs = eval('(' + conjMatch[1] + ')');
} catch (e) {
    console.error('Failed to eval conjugationVerbs:', e.message);
    process.exit(1);
}

// ── 5. Build data structures exactly like the app ─────────────────────────────
const wordDictionary = new Map();
const conjugatedFormIndex = new Map();

// 5a. Index lesson vocab
lessons.forEach(lesson => {
    if (!lesson.vocab) return;
    lesson.vocab.forEach(([es, en]) => {
        const key = es.toLowerCase();
        if (wordDictionary.has(key)) {
            const entry = wordDictionary.get(key);
            if (!entry.days.includes(lesson.day)) entry.days.push(lesson.day);
        } else {
            wordDictionary.set(key, { spanish: es, english: en, days: [lesson.day], isVerb: false });
        }
    });
});

// 5b. Add common words (deduplicate against lesson vocab)
commonSpanishWords.forEach(([es, en]) => {
    const key = es.toLowerCase();
    if (!wordDictionary.has(key)) {
        wordDictionary.set(key, { spanish: es, english: en, days: [], isVerb: false });
    }
});

// 5c. Index conjugation verbs
Object.entries(conjugationVerbs).forEach(([typeId, verbs]) => {
    verbs.forEach(v => {
        const verbKey = v.verb.toLowerCase();
        // Index conjugated forms → infinitive
        Object.values(v.forms).forEach(form => {
            const formKey = form.toLowerCase();
            if (formKey && formKey !== verbKey && !wordDictionary.has(formKey)) {
                conjugatedFormIndex.set(formKey, v.verb.toLowerCase());
            }
        });
        // Mark as verb in dictionary
        if (wordDictionary.has(verbKey)) {
            wordDictionary.get(verbKey).isVerb = true;
        }
        // Handle compound verbs like "ser/ir"
        if (verbKey.includes('/')) {
            verbKey.split('/').forEach(part => {
                const pk = part.trim();
                if (wordDictionary.has(pk)) wordDictionary.get(pk).isVerb = true;
            });
        }
    });
});

// 5d. Mark common verbs that end in -ar, -er, -ir
wordDictionary.forEach((entry) => {
    const w = entry.spanish.toLowerCase();
    if ((w.endsWith('ar') || w.endsWith('er') || w.endsWith('ir')) && w.length > 3) {
        if (entry.english.startsWith('to ')) entry.isVerb = true;
    }
});

// ── 6. resolveWord and guessInfinitive ────────────────────────────────────────
function stripAccents(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function guessInfinitive(form) {
    const endings = [
        /ando$/, /iendo$/, /aste$/, /iste$/, /amos$/, /imos$/,
        /áis$/, /éis$/, /ís$/, /aron$/, /ieron$/,
        /aba$/, /abas$/, /ábamos$/, /aban$/,
        /ía$/, /ías$/, /íamos$/, /ían$/,
        /aré$/, /eré$/, /arás$/, /erás$/, /ará$/, /erá$/,
        /aremos$/, /eremos$/, /arán$/, /erán$/,
        /aría$/, /ería$/, /arías$/, /erías$/,
        /aríamos$/, /eríamos$/, /arían$/, /erían$/,
        /ado$/, /ido$/,
        /as$/, /es$/, /a$/, /e$/, /an$/, /en$/, /o$/, /i$/,
    ];
    const suffixes = ['ar', 'er', 'ir'];
    const patterns = [];
    for (const ending of endings) {
        for (const suffix of suffixes) {
            patterns.push([ending, suffix]);
        }
    }
    const stemChanges = [[/ie/, 'e'], [/ie/, 'i'], [/ue/, 'o'], [/ue/, 'u'], [/i(?=[^aeiouáéíóú])/, 'e']];
    for (const [ending, suffix] of patterns) {
        const stem = form.replace(ending, '');
        if (stem !== form && stem.length >= 2) {
            const candidate = stem + suffix;
            if (wordDictionary.has(candidate)) {
                const entry = wordDictionary.get(candidate);
                if (entry.isVerb) return candidate;
            }
            for (const [from, to] of stemChanges) {
                if (from.test(stem)) {
                    const fixedStem = stem.replace(from, to);
                    const fixedCandidate = fixedStem + suffix;
                    if (wordDictionary.has(fixedCandidate)) {
                        const entry = wordDictionary.get(fixedCandidate);
                        if (entry.isVerb) return fixedCandidate;
                    }
                }
            }
        }
    }
    return null;
}

const cliticPatternCompound = /(?:(?:me|te|se|nos|le)(?:lo|la|los|las)|me|te|se|nos|le|lo|la|les|los|las)$/;

function tryResolveKey(key) {
    if (wordDictionary.has(key)) return key;
    if (conjugatedFormIndex.has(key)) return conjugatedFormIndex.get(key);
    const singular = key.endsWith('es') && key.length > 4 ? key.slice(0, -2) :
                     key.endsWith('s') && key.length > 3 ? key.slice(0, -1) : null;
    if (singular) {
        if (wordDictionary.has(singular)) return singular;
        if (conjugatedFormIndex.has(singular)) return conjugatedFormIndex.get(singular);
    }
    if (key.endsWith('a') && key.length > 3) {
        const masc = key.slice(0, -1) + 'o';
        if (wordDictionary.has(masc)) return masc;
    }
    if (wordDictionary.has(key + 'o')) return key + 'o';
    const stripped = key.replace(cliticPatternCompound, '');
    if (stripped !== key && stripped.length >= 2) {
        if (wordDictionary.has(stripped)) return stripped;
        if (conjugatedFormIndex.has(stripped)) return conjugatedFormIndex.get(stripped);
        const strippedInf = guessInfinitive(stripped);
        if (strippedInf) return strippedInf;
    }
    return guessInfinitive(key);
}

function resolveWord(word) {
    const key = word.toLowerCase();
    const result = tryResolveKey(key);
    if (result) return result;
    const noAccent = stripAccents(key);
    if (noAccent !== key) return tryResolveKey(noAccent);
    return null;
}

// ── 7. Extract dialogue text and audit ────────────────────────────────────────
function extractWords(text) {
    const cleaned = text.replace(/[¿¡?!.,;:"""''—\-–…()\[\]{}]/g, ' ');
    return cleaned.split(/\s+/).filter(w => w.length > 0);
}

let totalWordsAll = 0;
let totalUnresolvedAll = 0;
const globalUnresolved = new Map(); // word → Set of days it appears in

const results = [];

lessons.forEach(lesson => {
    if (!lesson.dialogue) return;

    const dayWords = [];
    const dayUnresolved = [];

    lesson.dialogue.forEach(line => {
        const words = extractWords(line.text);
        words.forEach(w => {
            const lower = w.toLowerCase();
            // Skip 1-2 letter words
            if (lower.length <= 2) return;

            dayWords.push(lower);
            const resolved = resolveWord(lower);
            if (resolved === null) {
                dayUnresolved.push(lower);
                if (!globalUnresolved.has(lower)) globalUnresolved.set(lower, new Set());
                globalUnresolved.get(lower).add(lesson.day);
            }
        });
    });

    totalWordsAll += dayWords.length;
    totalUnresolvedAll += dayUnresolved.length;

    results.push({
        day: lesson.day,
        level: lesson.level,
        title: lesson.title,
        totalWords: dayWords.length,
        unresolvedCount: dayUnresolved.length,
        unresolved: [...new Set(dayUnresolved)]
    });
});

// ── 8. Print report ───────────────────────────────────────────────────────────
console.log('='.repeat(80));
console.log('  DIALOGUE WORD AUDIT REPORT');
console.log('  Spanish Learning Tool — Word Lookup Resolution');
console.log('='.repeat(80));
console.log();
console.log(`Total lessons with dialogue: ${results.length}`);
console.log(`Total words checked (>2 chars): ${totalWordsAll}`);
console.log(`Total unresolved occurrences:   ${totalUnresolvedAll}`);
console.log(`Unique unresolved words:        ${globalUnresolved.size}`);
console.log(`Resolution rate:                ${((totalWordsAll - totalUnresolvedAll) / totalWordsAll * 100).toFixed(1)}%`);
console.log();

// Per-lesson report
console.log('-'.repeat(80));
console.log('  PER-LESSON BREAKDOWN');
console.log('-'.repeat(80));

results.forEach(r => {
    const pct = r.totalWords > 0 ? ((r.totalWords - r.unresolvedCount) / r.totalWords * 100).toFixed(0) : 100;
    const status = r.unresolvedCount === 0 ? 'OK' : `${r.unresolvedCount} unresolved`;
    console.log();
    console.log(`Day ${String(r.day).padStart(2)}: [${r.level}] ${r.title}`);
    console.log(`  Words: ${r.totalWords}  |  Resolved: ${pct}%  |  ${status}`);
    if (r.unresolved.length > 0) {
        console.log(`  Unresolved: ${r.unresolved.join(', ')}`);
    }
});

// Global unresolved summary
if (globalUnresolved.size > 0) {
    console.log();
    console.log('-'.repeat(80));
    console.log('  ALL UNRESOLVED WORDS (sorted alphabetically)');
    console.log('-'.repeat(80));
    console.log();

    const sorted = [...globalUnresolved.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    sorted.forEach(([word, days]) => {
        const dayList = [...days].sort((a, b) => a - b).join(', ');
        console.log(`  ${word.padEnd(25)} appears in day(s): ${dayList}`);
    });
}

console.log();
console.log('='.repeat(80));
console.log('  Dictionary stats:');
console.log(`    wordDictionary size:       ${wordDictionary.size} entries`);
console.log(`    conjugatedFormIndex size:   ${conjugatedFormIndex.size} entries`);
console.log('='.repeat(80));
