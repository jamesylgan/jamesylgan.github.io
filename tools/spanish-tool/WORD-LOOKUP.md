# Word Lookup Feature

Tap/click any Spanish word on the site to see its definition and full conjugation tables. Also available as a standalone search in the Extras tab.

## How It Works

### Word Dictionary
- Built lazily on first use via `buildWordDictionary()`
- Sources: all `lessons[].vocab` arrays + `commonSpanishWords` from `common-words.js`
- Lesson vocab takes priority (includes day references); common words fill gaps
- Stored as a `Map<string, { spanish, english, days[], isVerb }>` keyed by lowercase Spanish

### Conjugation Index
- Built alongside the dictionary from `conjugationVerbs`
- `Map<string, [{ typeId, tense, label, forms }]>` keyed by verb infinitive
- All 6 pronouns shown in modal (yo, tú, él/ella, nosotros, vosotros, ellos)
- Vosotros is display-only — the quiz system still uses 5 pronouns

### Where Words Are Clickable
- **Vocab table** in lessons — each Spanish word cell
- **Dialogue text** in lessons — individual recognized words
- **Vocab quiz** — the Spanish word in the prompt
- **Conjugation quiz** — the verb name in the prompt
- **Extras tab** — Word Lookup search results

## Key Functions

| Function | Purpose |
|----------|---------|
| `buildWordDictionary()` | Lazy-init dictionary + conjugation index |
| `openWordModal(word)` | Show word detail modal |
| `closeWordModal()` | Close modal |
| `filterWordLookup(query)` | Search dictionary, render results |
| `makeWordsClickable(text)` | Wrap recognized words in clickable spans |

## Adding/Modifying Data

### Adding a new lesson
- Dictionary auto-rebuilds from `lessons` — no extra steps needed
- Reset `wordDictionary = null` if you want to force a rebuild

### Adding common words
- Edit `common-words.js` — duplicates against lesson vocab are automatically skipped

### Adding conjugation verbs
- Add entries to `conjugationVerbs` in `index.html`
- Include `vosotros` form for all new entries

## Tab Rename

"Progress" was renamed to "Extras" in schema v6. The migration remaps `defaultTab: 'progress'` → `'extras'` automatically.

## Files

| File | Role |
|------|------|
| `index.html` | Main app — dictionary, modal, lookup, CSS |
| `common-words.js` | ~500 most common Spanish words (supplement data) |
| `translations-vi.js` | Vietnamese UI strings for word lookup |
