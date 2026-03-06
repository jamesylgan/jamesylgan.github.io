# EPUB Combiner

A browser-based tool for combining two EPUBs of different languages into a single dual-language EPUB with aligned text. Runs entirely client-side — no server or data transmission required.

## Features

### EPUB Parsing & Structure Detection
- Parses EPUB 2/3 files, extracting spine items, chapters, headings, and paragraph blocks
- Detects chapter numbers from headings in multiple languages (English, Spanish, German, French, Russian)
- Identifies BOOK/PART/VOLUME structure for proper chapter number flattening across parts

### Chapter-Level Alignment
- **Similarity matrix**: Scores chapter pairs using title similarity, block count ratio, content sampling, proper noun overlap, number overlap, and chapter number Jaccard
- **Monotonic DP pairing**: Finds optimal 1:1, 2:1, and 1:2 chapter pairings while allowing unpaired chapters
- **Front matter splitting**: Detects large front matter sections (preface, prologue, dedication) before the first chapter heading and isolates them as gaps
- **Merge guard**: Prevents merging chapters that would create severely imbalanced block ratios (< 0.25)
- **Smart skip penalties**: Chapters without chapter numbers (likely front matter) are cheaper to leave unpaired

### Paragraph-Level Alignment
- **Heading anchor matching**: Matches chapter headings by number (with offset detection), content similarity, and position
- **DP block alignment**: Aligns paragraph blocks using a dynamic programming algorithm with 1:1, 2:1, 3:1, and 4:1 merge operations
- **Heuristic similarity**: Multi-signal scoring combining length ratio, proper noun overlap, number matching, punctuation density, and cognate detection
- **Embedding similarity** (optional): Uses `multilingual-e5-small` for cross-language semantic similarity, blended with structural features
- **Sentence refinement**: Post-processing splits poorly-matched paragraph pairs into sentences and re-aligns, with a quality gate (≥40% match rate required)
- **Gap cascade repair**: Detects and repairs cascading gap sequences caused by alignment drift

### Output
- **Dual-language mode**: Side-by-side parallel text in a two-column layout
- **Single-language mode**: Interleaved paragraphs with language labels
- Manual editing UI: split, merge, reorder, link/unlink paragraph pairs
- Per-chapter confidence scores and review tracking

## Running Tests

```bash
cd tools/epub-combiner
npm install        # Install test dependencies (jsdom)
node test.js       # Run all tests (~271 assertions)
```

Test options:
- `DQ_FULL=1 node test.js` — Run with full Don Quixote chapters (slower, more thorough)
- `EMBEDDING=1 node test.js` — Include embedding vs heuristic comparison (downloads ~118MB model)

## Current Alignment Quality

Tested on Lighthouse Keeper (EN↔ES) and Don Quixote (EN↔ES):

| Metric | LK (4 chapters) | DQ (7 content pairs) | Overall |
|--------|-----------------|---------------------|---------|
| Alignment rate | 98.3% | 78.5% | 82.3% |
| Avg similarity (UI confidence) | 56.5% | 42.8% | 46.7% |
| Chapters ≥ 60% rate | 4/4 | 6/7 | 10/11 |

## Ideas for Improving Alignment Accuracy

### Hybrid Embedding + Heuristic Scoring
The pure embedding approach (60.7%) performed worse than the heuristic (82.3%) in tests, likely because the heuristic's multi-signal approach (names, numbers, punctuation, cognates) provides strong structural cues that embeddings miss. A hybrid approach could use embeddings as one signal within the heuristic framework — e.g., replacing or supplementing the cognate score with embedding cosine similarity for blocks where structural signals are weak.

### BOOK-Level Alignment as Reset Points
Don Quixote uses BOOK-relative chapter numbering (CHAP. I resets in each BOOK) while the Spanish edition uses absolute numbering. Using BOOK/PART headings as hard alignment boundaries would allow per-book chapter number offset detection, improving heading matching within each section.

### Translation-Assisted Alignment
When a translation API is available, translating a sample of blocks and comparing directly would give much higher-confidence similarity scores. This could be used selectively for ambiguous pairs where the heuristic score is in the 0.3–0.5 range.

### Content-Based Chapter Pairing Validation
After initial DP chapter pairing, run a quick paragraph alignment sample (3-4 blocks per side) to validate each pair. If the sample alignment quality is poor, try alternative pairings. This catches cases where chapter-level metadata matches but the actual content doesn't correspond.

### Adaptive Gap Penalties
Currently gap penalties are static based on block count ratio. An adaptive approach could adjust penalties based on the local alignment quality — in regions where matches are strong, gaps should be more costly (alignment is reliable), while in regions with weak matches, gaps should be cheaper (allowing the aligner to skip genuinely unmatched content).
