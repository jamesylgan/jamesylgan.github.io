#!/usr/bin/env node
/**
 * Integration tests for Spanish Learning Tool settings.
 * Tests conjugation visibility, dictionary settings, language switching, and learn lessons.
 * Run: node test.js
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// ─── Setup ───
const htmlPath = path.join(__dirname, 'index.html');
const htmlSrc = fs.readFileSync(htmlPath, 'utf8');
const scriptMatch = htmlSrc.match(/<script>\s*([\s\S]*?)\s*<\/script>/);
if (!scriptMatch) throw new Error('Could not find <script> block');

// Build minimal DOM
const dom = new JSDOM(`<!DOCTYPE html><html><body>
  <div id="dayGrid"></div><div id="quizContainer"></div>
  <div id="vocabCountButtons"></div><div id="conjCountButtons"></div>
  <div id="conjTypeSelector"></div><div id="wordLookupResults"></div>
  <div id="lookupConjTensesContainer"></div>
  <div id="wordModal"><div id="wordModalContent"></div></div>
  <div id="lessonView"></div>
  <div id="learnView"></div><div id="learnGrid"></div>
  <div id="learnGridContainer"></div><div id="learnTitle"></div>
  <div id="learnSubtitle"></div><div id="learnContent"></div>
  <div id="prevLearnBtn"></div><div id="nextLearnBtn"></div>
  <div id="markLearnBtn"></div><div id="lastSaved"></div>
  <input id="lang1Label" value=""><input id="lang2Label" value="">
  <input id="unlockAllConjCheckbox" type="checkbox">
  <input id="hardModeCheckbox" type="checkbox">
  <input id="compactHeaderCheckbox" type="checkbox">
  <div id="hardModeVocabSection" style="display:none"></div>
  <div id="dictLoadStatus"></div>
  <div id="uploadStatus"></div><div id="progressContainer"></div>
  <div id="confidenceSummary"></div><div id="rowProgress"></div>
  <div id="tab-lessons" class="tab-content"></div>
  <div id="tab-quiz" class="tab-content"></div>
  <div id="tab-extras" class="tab-content"></div>
  <div id="dictStatusLight"></div><div id="dictStatusExpanded"></div><div id="dictStatusFull"></div>
  <div id="infoModalOverlay"></div>
  <div id="resetModal"><input id="resetConfirmInput"><button id="resetConfirmBtn" disabled></button></div>
  <div class="tab" data-tab="lessons"></div><div class="tab" data-tab="quiz"></div><div class="tab" data-tab="extras"></div>
  <div class="panel" id="lessons-panel"></div><div class="panel" id="quiz-panel"></div><div class="panel" id="extras-panel"></div>
  <div id="langVi"></div><div id="langEn"></div>
  <div id="moveCompletedCheckbox"></div><div id="showFlagsCheckbox"></div>
</body></html>`, {
  url: 'http://localhost',
  runScripts: 'dangerously',
  pretendToBeVisual: true
});

const { window } = dom;
window.alert = (msg) => { window._lastAlert = msg; };
window.confirm = () => true;
window.setInterval = () => 0; // stub auto-save

// Load dependencies
// Load StorageVersionManager (stub localStorage)
window.localStorage = { _data: {}, getItem(k) { return this._data[k] || null; }, setItem(k, v) { this._data[k] = v; }, removeItem(k) { delete this._data[k]; }, get length() { return Object.keys(this._data).length; }, key(i) { return Object.keys(this._data)[i]; } };
const svmPath = path.join(__dirname, '..', 'lib', 'storage-version-manager.js');
if (fs.existsSync(svmPath)) {
  const s = window.document.createElement('script');
  s.textContent = fs.readFileSync(svmPath, 'utf8');
  window.document.body.appendChild(s);
}

const dictPath = path.join(__dirname, 'es-en-dict.js');
if (fs.existsSync(dictPath)) {
  const s = window.document.createElement('script');
  s.textContent = fs.readFileSync(dictPath, 'utf8');
  window.document.body.appendChild(s);
}

const conjugatorPath = path.join(__dirname, '..', 'lib', 'es-conjugator.js');
if (fs.existsSync(conjugatorPath)) {
  const s = window.document.createElement('script');
  s.textContent = fs.readFileSync(conjugatorPath, 'utf8');
  window.document.body.appendChild(s);
}

// Load common-words
const cwPath = path.join(__dirname, 'common-words.js');
if (fs.existsSync(cwPath)) {
  const s = window.document.createElement('script');
  s.textContent = fs.readFileSync(cwPath, 'utf8');
  window.document.body.appendChild(s);
}

// Inject main script
const scriptEl = window.document.createElement('script');
scriptEl.textContent = scriptMatch[1];
let evalError = null;
window.addEventListener('error', (e) => { evalError = e.error || e.message; });
window.document.body.appendChild(scriptEl);
if (evalError) { console.error('Script evaluation error:', evalError); process.exit(1); }

// Export functions
const exportScript = window.document.createElement('script');
exportScript.textContent = `
window.T = {
  get progress() { return progress; }, set progress(v) { progress = v; },
  get chapterPairs() { return typeof chapterPairs !== 'undefined' ? chapterPairs : []; },
  isLookupTenseVisible, isConjTypeUnlocked, renderLookupConjSettings,
  toggleUnlockAllConj, toggleLookupConjTense, lookupConjCheckAll,
  autoConjugate: typeof autoConjugate !== 'undefined' ? autoConjugate : null,
  isIrregularVerb: typeof isIrregularVerb !== 'undefined' ? isIrregularVerb : null,
  identifyConjugation: typeof identifyConjugation !== 'undefined' ? identifyConjugation : null,
  learnLessons, renderLearnContent,
  conjugationTypes, lookupTenseOrder, autoConjTenseToKey,
  getMaxCompletedDay,
  setDictSize, toggleHardMode,
  changeLanguage,
  buildWordDictionary, filterWordLookup,
  externalDictLookup,
};
`;
window.document.body.appendChild(exportScript);
const T = window.T;
if (!T) { console.error('Failed to export'); process.exit(1); }

// ─── Test Framework ───
let passed = 0, failed = 0, errors = [];
function assert(cond, msg) { if (cond) passed++; else { failed++; errors.push(msg); console.log('  FAIL:', msg); } }
function assertEq(a, b, msg) { assert(a === b, `${msg} — got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`); }
function section(name) { console.log(`\n── ${name} ──`); }

// ─── Tests ───

section('Conjugation Visibility — Locked Tenses');
{
  // Reset: no completed days, unlock-all off
  T.progress.completedDays = [];
  T.progress.unlockAllConj = false;
  T.progress.lookupConjTenses = {};

  // Present unlocks at day 3-7 depending on type. With no days complete, should be locked.
  const presentVisible = T.isLookupTenseVisible('present', true);
  assert(!presentVisible, 'Present locked when no days completed');

  const futureVisible = T.isLookupTenseVisible('future', true);
  assert(!futureVisible, 'Future locked when no days completed');

  // Non-finite always visible by default
  const nonFiniteVisible = T.isLookupTenseVisible('Non-Finite', true);
  assert(nonFiniteVisible, 'Non-Finite visible by default');
}

section('Conjugation Visibility — Unlocked by Lesson Progress');
{
  T.progress.completedDays = [1, 2, 3, 4, 5];
  T.progress.unlockAllConj = false;
  T.progress.lookupConjTenses = {};

  // Present -AR unlocks at day 5
  const presentVisible = T.isLookupTenseVisible('present', true);
  assert(presentVisible, 'Present unlocked after completing day 5');

  // Preterite unlocks at day 16 — still locked
  const pretVisible = T.isLookupTenseVisible('preterite', true);
  assert(!pretVisible, 'Preterite still locked (need day 16)');
}

section('Conjugation Visibility — Unlock All Toggle');
{
  T.progress.completedDays = [];
  T.progress.unlockAllConj = true;
  T.progress.lookupConjTenses = {};

  const pretVisible = T.isLookupTenseVisible('preterite', true);
  assert(pretVisible, 'Preterite visible with unlock-all on');

  const subjVisible = T.isLookupTenseVisible('subjunctive', true);
  assert(subjVisible, 'Subjunctive visible with unlock-all on');

  // Turn off unlock-all — should hide again
  T.progress.unlockAllConj = false;
  const pretHidden = T.isLookupTenseVisible('preterite', true);
  assert(!pretHidden, 'Preterite hidden after unlock-all turned off');
}

section('Conjugation Visibility — Checked + Locked = Hidden');
{
  T.progress.completedDays = [1, 2, 3, 4, 5];
  T.progress.unlockAllConj = false;
  T.progress.lookupConjTenses = { preterite: true }; // user checked it while unlock-all was on

  // Preterite is checked but locked (needs day 16)
  const pretVisible = T.isLookupTenseVisible('preterite', true);
  assert(!pretVisible, 'Preterite: checked + locked = hidden');

  // Present is not explicitly set but unlocked
  const presentVisible = T.isLookupTenseVisible('present', true);
  assert(presentVisible, 'Present: default + unlocked = visible');
}

section('Conjugation Visibility — Unchecked = Hidden Even If Unlocked');
{
  T.progress.completedDays = [1, 2, 3, 4, 5];
  T.progress.unlockAllConj = false;
  T.progress.lookupConjTenses = { present: false };

  const presentVisible = T.isLookupTenseVisible('present', true);
  assert(!presentVisible, 'Present: explicitly unchecked = hidden');
}

section('Conjugation Visibility — Non-Finite Toggle');
{
  T.progress.lookupConjTenses = { '_non_finite': true };
  assert(T.isLookupTenseVisible('Non-Finite', true), 'Non-Finite: explicitly on = visible');

  T.progress.lookupConjTenses = { '_non_finite': false };
  assert(!T.isLookupTenseVisible('Non-Finite', true), 'Non-Finite: explicitly off = hidden');

  T.progress.lookupConjTenses = {};
  assert(T.isLookupTenseVisible('Non-Finite', true), 'Non-Finite: default = visible');
}

section('Auto-Conjugation — Regular Verbs');
if (T.autoConjugate) {
  const conj = T.autoConjugate('hablar');
  assert(conj !== null, 'hablar conjugates');
  assertEq(Object.keys(conj).length, 16, 'hablar has 16 tense groups');
  assertEq(conj['Present']['yo'], 'hablo', 'hablar present yo = hablo');
  assertEq(conj['Preterite']['yo'], 'hablé', 'hablar preterite yo = hablé');
  assertEq(conj['Imperfect']['yo'], 'hablaba', 'hablar imperfect yo = hablaba');
  assertEq(conj['Future']['yo'], 'hablaré', 'hablar future yo = hablaré');
  assertEq(conj['Conditional']['yo'], 'hablaría', 'hablar conditional yo = hablaría');
  assertEq(conj['Subjunctive']['yo'], 'hable', 'hablar subjunctive yo = hable');

  // Spelling changes
  const buscar = T.autoConjugate('buscar');
  assertEq(buscar['Preterite']['yo'], 'busqué', 'buscar preterite yo = busqué (c→qu)');
  assertEq(buscar['Subjunctive']['yo'], 'busque', 'buscar subjunctive yo = busque');

  const llegar = T.autoConjugate('llegar');
  assertEq(llegar['Preterite']['yo'], 'llegué', 'llegar preterite yo = llegué (g→gu)');

  const alcanzar = T.autoConjugate('alcanzar');
  assertEq(alcanzar['Preterite']['yo'], 'alcancé', 'alcanzar preterite yo = alcancé (z→c)');
}

section('Auto-Conjugation — Irregular Detection');
if (T.isIrregularVerb) {
  assert(T.isIrregularVerb('ser'), 'ser is irregular');
  assert(T.isIrregularVerb('estar'), 'estar is irregular');
  assert(T.isIrregularVerb('tener'), 'tener is irregular');
  assert(T.isIrregularVerb('dormir'), 'dormir is irregular (stem-change)');
  assert(T.isIrregularVerb('conocer'), 'conocer is irregular (c→zc)');
  assert(T.isIrregularVerb('componer'), 'componer is irregular (poner compound)');
  assert(T.isIrregularVerb('decaer'), 'decaer is irregular (caer compound via regex)');
  assert(!T.isIrregularVerb('hablar'), 'hablar is regular');
  assert(!T.isIrregularVerb('comer'), 'comer is regular');
  assert(!T.isIrregularVerb('vivir'), 'vivir is regular');
  assert(!T.isIrregularVerb('buscar'), 'buscar is regular (spelling change handled)');
  assert(!T.isIrregularVerb('llegar'), 'llegar is regular (spelling change handled)');
}

section('Conjugation Identification');
if (T.identifyConjugation) {
  const r1 = T.identifyConjugation('hablo', 'hablar');
  assert(r1 && r1.tense === 'Present' && r1.pronoun === 'yo', 'hablo = hablar/Present/yo');

  const r2 = T.identifyConjugation('hablaron', 'hablar');
  assert(r2 && r2.tense === 'Preterite' && r2.pronoun === 'ellos/ellas', 'hablaron = hablar/Preterite/ellos');

  const r3 = T.identifyConjugation('hablaría', 'hablar');
  assert(r3 && r3.tense === 'Conditional' && r3.pronoun === 'yo', 'hablaría = hablar/Conditional/yo');

  const r4 = T.identifyConjugation('busqué', 'buscar');
  assert(r4 && r4.tense === 'Preterite' && r4.pronoun === 'yo', 'busqué = buscar/Preterite/yo');
}

section('Dictionary Settings — Size Gating');
{
  // Light mode: externalDictLookup should only use stemmer
  T.progress.dictSize = 'light';
  // lookupSpanish is available from es-en-dict.js
  const r1 = T.externalDictLookup('hablar');
  assert(r1 !== null, 'Light mode: hablar found via stemmer');

  // Expanded mode: should also check expanded dict (if loaded)
  T.progress.dictSize = 'expanded';
  const r2 = T.externalDictLookup('hablar');
  assert(r2 !== null, 'Expanded mode: hablar found');
}

section('Hard Mode — Vietnamese Guard');
{
  T.progress.uiLanguage = 'vi';
  T.progress.hardModeVocab = false;
  T.toggleHardMode(true);
  assert(!T.progress.hardModeVocab, 'Hard mode blocked in Vietnamese');
  assert(window._lastAlert !== undefined, 'Alert shown for Vietnamese hard mode');

  T.progress.uiLanguage = 'en';
  T.toggleHardMode(true);
  assert(T.progress.hardModeVocab, 'Hard mode enabled in English');
  T.toggleHardMode(false); // cleanup
}

section('Learn Lessons — Content');
{
  assert(T.learnLessons.length === 21, '21 learn lessons exist');

  // Check all lessons have required fields
  for (const lesson of T.learnLessons) {
    if (lesson.customContent) continue;
    assert(lesson.title && lesson.title.length > 0, lesson.id + ' has title');
    assert(lesson.intro && lesson.intro.length > 0, lesson.id + ' has intro');
    assert(lesson.examples && lesson.examples.length > 0, lesson.id + ' has examples');
  }

  // Check explanations exist for key lessons
  const withExplanation = T.learnLessons.filter(l => l.explanation);
  assert(withExplanation.length >= 10, withExplanation.length + ' lessons have explanations (expect 10+)');
}

section('Learn Lessons — Vietnamese Translations');
{
  // Load Vietnamese translations
  const viPath = path.join(__dirname, 'translations-vi.js');
  if (fs.existsSync(viPath)) {
    const s = window.document.createElement('script');
    s.textContent = fs.readFileSync(viPath, 'utf8').replace(/^const /m, 'var ');
    window.document.body.appendChild(s);

    const vi = window.translationsVI;
    assert(vi && vi.learnLessons, 'Vietnamese learn lessons exist');

    if (vi && vi.learnLessons) {
      const viLessons = vi.learnLessons;
      let viCount = Object.keys(viLessons).length;
      assertEq(viCount, 21, 'All 21 lessons have Vietnamese translations');

      // Check each lesson has translated fields
      for (const lesson of T.learnLessons) {
        const viL = viLessons[lesson.id];
        if (!viL) { assert(false, lesson.id + ' missing Vietnamese'); continue; }
        assert(viL.title && viL.title.length > 0, lesson.id + ' has Vietnamese title');
        if (!lesson.customContent) {
          assert(viL.intro && viL.intro.length > 0, lesson.id + ' has Vietnamese intro');
        }
      }

      // Spot check: no "English equivalent" in Vietnamese
      const viStr = JSON.stringify(viLessons);
      assert(!viStr.includes('English equivalent'), 'No "English equivalent" in Vietnamese translations');
    }
  } else {
    console.log('  SKIP: translations-vi.js not found');
  }
}

section('Tense Key Mapping — All Tenses Covered');
{
  const autoKeys = Object.keys(T.autoConjTenseToKey);
  assert(autoKeys.length >= 16, autoKeys.length + ' auto-conjugate tense mappings');

  // All lookupTenseOrder entries should be in the mapping values (or _non_finite)
  for (const tense of T.lookupTenseOrder) {
    const found = Object.values(T.autoConjTenseToKey).includes(tense) || tense === '_non_finite';
    // tense might be a settings key, check if any autoConj key maps to it
    const mapped = Object.entries(T.autoConjTenseToKey).find(([k, v]) => v === tense);
    assert(mapped || tense === '_non_finite', 'lookupTenseOrder "' + tense + '" has autoConj mapping');
  }
}

// ─── Summary ───
console.log(`\n${'═'.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log(`\nFailures:`);
  errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
}
console.log('═'.repeat(50));
process.exit(failed > 0 ? 1 : 0);
