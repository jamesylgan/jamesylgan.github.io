#!/usr/bin/env node
/**
 * Audit script: checks translation coverage for the Spanish learning tool.
 * Verifies that all vocabulary words and UI strings have translations
 * in all supported languages.
 *
 * Usage: node lib/test/audit-translations.cjs
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

// ── 4. Extract English translations (translations.en) from index.html ────────
// The structure is: const translations = { en: { ... } };
const transMatch = html.match(/const translations\s*=\s*(\{[\s\S]*?\n    \});/);
if (!transMatch) { console.error('Could not extract translations'); process.exit(1); }
let translationsEN;
try {
    const allTrans = eval('(' + transMatch[1] + ')');
    translationsEN = allTrans.en || allTrans;
} catch (e) {
    console.error('Failed to eval translations:', e.message);
    process.exit(1);
}

// ── 5. Load translation files ─────────────────────────────────────────────────
// Discover all translations-*.js files
const translationFiles = fs.readdirSync(ROOT)
    .filter(f => /^translations-[a-z]{2}\.js$/.test(f))
    .map(f => ({
        file: f,
        lang: f.match(/translations-([a-z]{2})\.js/)[1],
    }));

if (translationFiles.length === 0) {
    console.error('No translation files found (translations-*.js)');
    process.exit(1);
}

const translationData = {};
for (const { file, lang } of translationFiles) {
    const filePath = path.join(ROOT, file);
    const code = fs.readFileSync(filePath, 'utf-8');
    try {
        // Extract the variable name from the file (e.g., translationsVI)
        const varMatch = code.match(/const (\w+)\s*=\s*\{/);
        if (!varMatch) throw new Error('Could not find translation object');
        const varName = varMatch[1];
        const fn = new Function(code + `\nreturn ${varName};`);
        translationData[lang] = fn();
    } catch (e) {
        console.error(`Failed to load ${file}:`, e.message);
        process.exit(1);
    }
}

// ── 6. Audit UI translations ─────────────────────────────────────────────────
function flattenKeys(obj, prefix = '') {
    const keys = [];
    for (const [key, val] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
            keys.push(...flattenKeys(val, fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

console.log('='.repeat(80));
console.log('  TRANSLATION COVERAGE AUDIT REPORT');
console.log('  Spanish Learning Tool — Multi-Language Support');
console.log('='.repeat(80));
console.log();

const allLangs = Object.keys(translationData);
console.log(`Languages found: ${allLangs.join(', ')}`);
console.log();

// ── 6a. UI string coverage ───────────────────────────────────────────────────
console.log('-'.repeat(80));
console.log('  UI STRING COVERAGE');
console.log('-'.repeat(80));
console.log();

// English translations are flat (not nested under 'ui'), so use them directly
const enUIKeys = Object.keys(translationsEN);

for (const lang of allLangs) {
    const langUI = translationData[lang]?.ui || {};
    const langUIKeys = Object.keys(langUI);
    const missing = enUIKeys.filter(k => !langUI.hasOwnProperty(k));
    const extra = langUIKeys.filter(k => !translationsEN.hasOwnProperty(k));

    console.log(`[${lang}] UI strings: ${langUIKeys.length}/${enUIKeys.length}`);
    if (missing.length > 0) {
        console.log(`  Missing (${missing.length}): ${missing.join(', ')}`);
    }
    if (extra.length > 0) {
        console.log(`  Extra keys not in English (${extra.length}): ${extra.join(', ')}`);
    }
    if (missing.length === 0 && extra.length === 0) {
        console.log('  OK — fully covered');
    }
    console.log();
}

// ── 6b. Lesson content coverage ──────────────────────────────────────────────
console.log('-'.repeat(80));
console.log('  LESSON CONTENT COVERAGE');
console.log('-'.repeat(80));
console.log();

const lessonDays = lessons.map(l => l.day);

for (const lang of allLangs) {
    const langLessons = translationData[lang]?.lessons || {};
    const coveredDays = Object.keys(langLessons).map(Number);
    const missingDays = lessonDays.filter(d => !coveredDays.includes(d));

    console.log(`[${lang}] Lesson content: ${coveredDays.length}/${lessonDays.length} days`);
    if (missingDays.length > 0) {
        console.log(`  Missing days: ${missingDays.join(', ')}`);
    } else {
        console.log('  OK — all days covered');
    }

    // Check for completeness within each lesson
    let incompleteCount = 0;
    const incompleteDetails = [];
    for (const day of coveredDays) {
        const enLesson = lessons.find(l => l.day === day);
        if (!enLesson) continue;
        const langLesson = langLessons[day];
        const missing = [];
        if (enLesson.title && !langLesson.title) missing.push('title');
        if (enLesson.phrases && (!langLesson.phrases || langLesson.phrases.length < enLesson.phrases.length)) {
            missing.push(`phrases (${(langLesson.phrases || []).length}/${enLesson.phrases.length})`);
        }
        if (enLesson.grammar && (!langLesson.grammar || langLesson.grammar.length < enLesson.grammar.length)) {
            missing.push(`grammar (${(langLesson.grammar || []).length}/${enLesson.grammar.length})`);
        }
        if (enLesson.dialogue && enLesson.dialogueNote && !langLesson.dialogueNote) {
            missing.push('dialogueNote');
        }
        if (enLesson.practice && (!langLesson.practice || langLesson.practice.length < enLesson.practice.length)) {
            missing.push(`practice (${(langLesson.practice || []).length}/${enLesson.practice.length})`);
        }
        if (missing.length > 0) {
            incompleteCount++;
            incompleteDetails.push(`  Day ${day}: missing ${missing.join(', ')}`);
        }
    }
    if (incompleteCount > 0) {
        console.log(`  Incomplete lessons (${incompleteCount}):`);
        incompleteDetails.forEach(d => console.log(d));
    }
    console.log();
}

// ── 6c. Vocabulary coverage ──────────────────────────────────────────────────
// The app resolves Vietnamese translations from two sources:
//   1. translationsVI.vocab[day][word] — per-lesson vocab
//   2. translationsVI.commonVocab[word] — common words
// Build a combined index matching the app's getViTranslation() behavior.
console.log('-'.repeat(80));
console.log('  VOCABULARY TRANSLATION COVERAGE');
console.log('-'.repeat(80));
console.log();

const allSpanishWords = commonSpanishWords.map(([es]) => es.toLowerCase());

for (const lang of allLangs) {
    // Build combined translation index (vocab + commonVocab)
    const allTransKeys = new Set();
    const langPerDayVocab = translationData[lang]?.vocab || {};
    for (const day in langPerDayVocab) {
        Object.keys(langPerDayVocab[day]).forEach(k => allTransKeys.add(k.toLowerCase()));
    }
    const langCommonVocab = translationData[lang]?.commonVocab || {};
    Object.keys(langCommonVocab).forEach(k => allTransKeys.add(k.toLowerCase()));

    // Check common-words.js coverage
    const missingCommon = allSpanishWords.filter(w => !allTransKeys.has(w));
    console.log(`[${lang}] Common words: ${allSpanishWords.length - missingCommon.length}/${allSpanishWords.length}`);
    if (missingCommon.length > 0) {
        console.log(`  Missing (${missingCommon.length}):`);
        const show = missingCommon.slice(0, 30);
        console.log(`    ${show.join(', ')}${missingCommon.length > 30 ? `, ... and ${missingCommon.length - 30} more` : ''}`);
    } else {
        console.log('  OK — all common words have translations');
    }

    // Check lesson vocab coverage
    let totalVocab = 0;
    let coveredVocab = 0;
    const missingWords = [];

    lessons.forEach(lesson => {
        if (!lesson.vocab) return;
        lesson.vocab.forEach(([es]) => {
            totalVocab++;
            if (allTransKeys.has(es.toLowerCase())) {
                coveredVocab++;
            } else {
                missingWords.push({ word: es, day: lesson.day });
            }
        });
    });

    console.log(`[${lang}] Lesson vocab: ${coveredVocab}/${totalVocab}`);
    if (missingWords.length > 0) {
        console.log(`  Missing translations (${missingWords.length}):`);
        const byDay = {};
        missingWords.forEach(({ word, day }) => {
            if (!byDay[day]) byDay[day] = [];
            byDay[day].push(word);
        });
        Object.entries(byDay).forEach(([day, words]) => {
            console.log(`    Day ${day}: ${words.join(', ')}`);
        });
    } else {
        console.log('  OK — all lesson vocab words have translations');
    }

    // Report source breakdown
    const commonVocabCount = Object.keys(langCommonVocab).length;
    let perDayCount = 0;
    for (const day in langPerDayVocab) {
        perDayCount += Object.keys(langPerDayVocab[day]).length;
    }
    console.log(`  Sources: ${perDayCount} in per-lesson vocab, ${commonVocabCount} in commonVocab (${allTransKeys.size} unique total)`);
    console.log();
}

// ── 7. Summary ───────────────────────────────────────────────────────────────
console.log('='.repeat(80));
console.log('  SUMMARY');
console.log('='.repeat(80));
console.log();

for (const lang of allLangs) {
    const langUI = translationData[lang]?.ui || {};
    const langLessons = translationData[lang]?.lessons || {};

    // Build combined vocab index (same as above)
    const allTransKeys = new Set();
    const langPerDayVocab = translationData[lang]?.vocab || {};
    for (const day in langPerDayVocab) {
        Object.keys(langPerDayVocab[day]).forEach(k => allTransKeys.add(k.toLowerCase()));
    }
    const langCommonVocab = translationData[lang]?.commonVocab || {};
    Object.keys(langCommonVocab).forEach(k => allTransKeys.add(k.toLowerCase()));

    const matchedUI = Object.keys(langUI).filter(k => enUIKeys.includes(k)).length;
    const uiCoverage = enUIKeys.length > 0
        ? (matchedUI / enUIKeys.length * 100).toFixed(1)
        : '100.0';
    const lessonCoverage = lessonDays.length > 0
        ? (Object.keys(langLessons).map(Number).filter(d => lessonDays.includes(d)).length / lessonDays.length * 100).toFixed(1)
        : '100.0';
    const vocabCoverage = allSpanishWords.length > 0
        ? (allSpanishWords.filter(w => allTransKeys.has(w)).length / allSpanishWords.length * 100).toFixed(1)
        : '100.0';

    console.log(`[${lang}] UI: ${uiCoverage}%  |  Lessons: ${lessonCoverage}%  |  Vocab: ${vocabCoverage}%`);
}

console.log();
console.log('='.repeat(80));
