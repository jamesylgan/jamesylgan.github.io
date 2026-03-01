# Translation System

This document explains how multi-language support works in the Spanish learning tool.

## Architecture

All translations are separated from the main `index.html`:
- **English** is the default/fallback language embedded in `index.html`
- **Other languages** live in separate files: `translations-{lang}.js`

### File Structure
```
spanish-tool/
├── index.html              # Main app (English only)
├── translations-vi.js      # Vietnamese translations
├── translations-{lang}.js  # Other languages (future)
└── TRANSLATION.md          # This file
```

## Translation File Format

Each translation file exports a `translationsVI` object (or `translations{LANG}`) with three sections:

```javascript
const translationsVI = {
  // 1. UI strings (interface labels, buttons, messages)
  ui: {
    pageTitle: 'Lộ Trình Tiếng Tây Ban Nha Giao Tiếp',
    tabLessons: 'Bài học',
    // ... all UI strings
  },

  // 2. Lesson content (title, phrases, grammar, dialogueNote, practice)
  lessons: {
    1: {
      title: "Bảng chữ cái, chào hỏi, số 0-20",
      phrases: ["Hola. — Chào/ Xin chào.", ...],
      grammar: ["Grammar point in Vietnamese...", ...],
      dialogueNote: "Dialogue context in Vietnamese",
      practice: ["Practice task in Vietnamese...", ...]
    },
    // ... days 2-45
  },

  // 3. Vocabulary (Spanish word -> translation)
  vocab: {
    1: {
      "cero": "số không",
      "uno": "một",
      // ... all vocab for day 1
    },
    // ... days 2-45
  }
};
```

## How It Works

### Lazy Loading
Translation files are loaded on-demand:
1. On page load, only English is available
2. When user selects Vietnamese, `translations-vi.js` is loaded dynamically
3. The script is cached after first load

### Fallback Behavior
All translation lookups fall back to English:
- `t(key)` - Returns Vietnamese UI string if available, else English
- `getLessonTranslation(day, field, fallback)` - Returns Vietnamese lesson content if available, else the English fallback
- Vocab lookup - Returns Vietnamese if available, else English

### Key Functions in index.html

```javascript
// UI string translation
function t(key) {
  if (lang === 'vi' && translationsVI?.ui?.[key]) {
    return translationsVI.ui[key];
  }
  return translations.en[key] || key;
}

// Lesson content translation
function getLessonTranslation(day, field, fallback) {
  if (lang === 'vi' && translationsVI?.lessons?.[day]?.[field]) {
    return translationsVI.lessons[day][field];
  }
  return fallback;
}

// Vocab translation (inline in openLesson)
// Uses: translationsVI?.vocab?.[day]?.[spanishWord]
```

## Adding a New Language

1. **Create translation file**: `translations-{lang}.js`
   - Copy structure from `translations-vi.js`
   - Replace Vietnamese with your language
   - Keep the same keys

2. **Update index.html**:
   - Add language option to selector:
     ```html
     <option value="fr">Français</option>
     ```
   - Update `loadVietnameseTranslations()` to be generic or add similar function
   - Update `t()` and `getLessonTranslation()` to check new language

3. **Translation sources**:
   - UI strings: Translate from `translations.en` in index.html
   - Lesson content: Translate from the English lessons array
   - Vocab: Translate from the English vocab in lessons array

## What NOT to Change in index.html

- `translations.en` object - English UI strings (source of truth)
- `lessons` array - English lesson content (source of truth)
- Vocab arrays are `[spanish, english]` only - no inline translations

## Language Selector

The language selector option labels should stay in their native language:
- `<option value="en">English</option>`
- `<option value="vi">Tiếng Việt</option>`

This is the only place non-English text appears in index.html.
