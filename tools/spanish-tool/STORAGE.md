# Local Storage Schema

This tool uses versioned local storage via `StorageVersionManager`. **If you modify the data structure stored in localStorage, you MUST update the schema version and add a migration.**

## Current Schema

**Key:** `spanishProgress`
**Version:** 4

```javascript
{
    completedDays: [],           // Array of day numbers (e.g., [1, 2, 5])
    sectionChecks: {},           // Object like { "1-phrases": true, "1-vocab": false }
    quizScores: [],              // Array of quiz score objects (vocab or conjugation)
    vocabSRS: {},                // Anki-style SRS data: { "word": { wrongCount, lastSeen, ease } }
    conjSRS: {},                 // Conjugation SRS data: { "verb_type_pronoun": { wrongCount, lastSeen, ease } }
    uiLanguage: 'en',            // UI language preference: 'en' (English) or 'vi' (Vietnamese)
    lastSaved: null              // ISO date string or null
}
```

### vocabSRS Entry Structure
```javascript
// Key format: "spanish_word" (e.g., "hola", "trabajar")
{
    wrongCount: 0,    // Number of times answered incorrectly (used for prioritization)
    lastSeen: null,   // ISO date string of last review
    ease: 2.5         // Difficulty multiplier (1.3 = hard, 3.0 = easy)
}
```

### conjSRS Entry Structure
```javascript
// Key format: "verb_typeId_pronoun" (e.g., "hablar_present_ar_yo")
{
    wrongCount: 0,    // Number of times answered incorrectly
    lastSeen: null,   // ISO date string of last review
    ease: 2.5         // Difficulty multiplier (1.3 = hard, 3.0 = easy)
}
```

### quizScores Entry Structure
```javascript
// Vocab quiz
{ type: 'vocab', score: 8, total: 10, uniqueWords: 10, date: '...' }

// Conjugation quiz
{ type: 'conjugation', types: ['present_ar', 'present_er_ir'], score: 12, total: 15, uniqueQuestions: 15, date: '...' }
```

### uiLanguage Values
| Value | Language |
|-------|----------|
| en | English (default) |
| vi | Vietnamese |

### Conjugation Types (aligned with lessons)
| Type ID | Label | Unlocks at Day |
|---------|-------|----------------|
| present_ser_estar | Ser/Estar (Present) | Day 3 |
| present_ar | -AR Verbs (Present) | Day 5 |
| present_er_ir | -ER/-IR Verbs (Present) | Day 6 |
| present_irregular | Irregulars (Present) | Day 7 |
| preterite_ar | -AR Verbs (Preterite) | Day 16 |
| preterite_er_ir | -ER/-IR Verbs (Preterite) | Day 17 |
| preterite_irregular | Irregulars (Preterite) | Day 18 |
| imperfect | Imperfect | Day 19 |
| future | Future Simple | Day 22 |
| conditional | Conditional | Day 28 |
| subjunctive_present | Subjunctive (Present) | Day 33 |

## How to Make Schema Changes

1. **Bump the version number** in the schema definition
2. **Add a migration function** for the new version
3. **Update the default** if the structure changes

### Example: Adding a new field

```javascript
const spanishProgressSchema = StorageVersionManager.defineSchema('spanishProgress', {
    version: 2,  // <-- Bumped from 1 to 2
    default: {
        completedDays: [],
        sectionChecks: {},
        quizScores: [],
        lastSaved: null,
        streakCount: 0  // <-- New field
    },
    migrations: {
        1: (data) => ({
            completedDays: data.completedDays || [],
            sectionChecks: data.sectionChecks || {},
            quizScores: data.quizScores || [],
            lastSaved: data.lastSaved || null
        }),
        // New migration for v2
        2: (data) => ({
            ...data,
            streakCount: 0  // <-- Initialize new field
        })
    }
});
```

### Example: Renaming a field

```javascript
migrations: {
    // ... existing migrations ...
    3: (data) => ({
        ...data,
        completedLessons: data.completedDays,  // Rename field
        completedDays: undefined  // Remove old field
    })
}
```

### Example: Changing data structure

```javascript
migrations: {
    // ... existing migrations ...
    4: (data) => ({
        ...data,
        // Convert array to object with more details
        quizScores: data.quizScores.map(score => ({
            value: score,
            date: new Date().toISOString()
        }))
    })
}
```

## Important Rules

1. **Never modify existing migrations** - they must remain stable for users with old data
2. **Always increment version by 1** - migrations run sequentially
3. **Test migrations** - load old data format and verify it migrates correctly
4. **Update this document** when you change the schema

## Files

- Schema definition: `index.html` (search for `spanishProgressSchema`)
- Version manager library: `../lib/storage-version-manager.js`
