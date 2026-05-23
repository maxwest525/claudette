# Ingestion Roadmap

## Phase 1 — Manual Drop Zone (Now)
- Drop files into `imports/drop-zone/`
- Run `npm run ingest:save` to register files
- Run `npm run ingest:index` to build source index
- Track sources manually via `npm run source:track`

## Phase 2 — Processing & Classification (Complete)
- ✅ Process pipeline: normalize, extract stats, score quality and skill candidacy
- ✅ Enrichment: keyword-based category classification (12 categories), tag enrichment
- ✅ Deduplication: URL exact, content hash exact, Jaccard near-duplicate (threshold 0.6)
- ✅ Skill candidate detection: score-ranked candidate list
- ✅ Promote: promote processed items to skill scaffolds

## Phase 3 — GitHub Import (Planned)
- Clone public repos
- Extract README, docs, markdown files
- Auto-tag by repo topic
- Rate-limit aware crawling

## Phase 4 — PDF Extraction (Planned)
- PDF text extraction (pdfjs or pdf2json)
- Section chunking
- Heading detection
- Metadata extraction from PDF properties

## Phase 5 — Conversation Extraction (Planned)
- Parse exported conversation JSON
- Extract user/assistant turns
- Identify skill candidates from assistant responses
- Auto-generate SKILL.md drafts

## Phase 6 — AI-Assisted Ingestion (Future)
- LLM-based classification
- Auto-tagging
- Duplicate detection with embeddings
- Quality scoring
- Gap analysis
