# Lovable Operating System — Architecture

## Overview

The Lovable OS is a centralized repository for managing Lovable Skills, Workspace Knowledge, Project Knowledge, Design Systems, and Templates at scale.

## Folder Structure

```
lovable-operating-system/
├── workspace-knowledge/    # Workspace-level knowledge docs
├── project-knowledge/      # Project-specific knowledge docs
├── skills/                 # Validated Lovable skills
├── design-systems/         # Design system packages
├── templates/              # Reusable project scaffolds
├── scripts/                # Automation scripts
├── schemas/                # Zod + TypeScript schemas
├── generators/             # Scaffold generators
├── validators/             # Validation logic
├── imports/drop-zone/      # Manual import drop zone
├── exports/                # Packaged exports (ZIPs)
├── raw-ingestion/          # Phase 1: raw source collection
├── processed/              # Phase 2: processed artifacts
├── duplicates/             # Duplicate detection reports
├── archive/                # Archived/deprecated items
└── docs/                   # Documentation
```

## Phase 1: Raw Source Collection (Current)

Goals:
- Collect raw content from any source (web, GitHub, PDFs, conversations, manual)
- Track all sources in `source-tracker.json`
- Log all crawl sessions in `crawl-log.json`
- Index all collected files in `source-index.json`
- No processing, classification, or deduplication yet

### Drop Zones

- `imports/drop-zone/` — manual file drops
- `raw-ingestion/html/` — raw HTML
- `raw-ingestion/markdown/` — raw Markdown
- `raw-ingestion/text/` — raw text/txt
- `raw-ingestion/pdfs/` — raw PDFs
- `raw-ingestion/conversations/` — conversation exports

## Phase 2: Processing (Active)

Pipeline: `npm run phase2` runs all steps in sequence.

1. **Process** (`npm run process`) — reads raw-ingestion sources, normalizes content, extracts stats (word count, headings, code blocks, content hash), scores quality and skill candidacy, writes to `processed/`
2. **Enrich** (`npm run enrich`) — classifies by category (12 keyword categories), enriches tags, updates status to `enriched`
3. **Dedup** (`npm run dedup`) — three-pass deduplication: URL exact → content hash exact → Jaccard near-duplicate (threshold 0.6), outputs `duplicates/dedup-report.md`
4. **Candidates** (`npm run candidates`) — filters items with skill_candidate_score >= 0.4, outputs `processed/skill-candidates.json`
5. **Promote** (`npm run promote <id> <skill-name>`) — promotes a processed item to a full skill scaffold

## Phase 3: Packaging & Export (Active)

Pipeline: `npm run phase3` runs all steps in sequence.

1. **Batch promote** (`npm run batch:promote [threshold]`) — promotes all skill candidates above threshold (default 0.5) to `skills/` folders, auto-generating skill names from titles
2. **Batch package** (`npm run package:batch`) — validates and ZIPs all skills in `skills/` to `exports/`
3. **Bundle** (`npm run bundle [version]`) — creates a versioned bundle ZIP in `exports/bundles/` containing all skill ZIPs + manifest + BUNDLE.md
4. **Report** (`npm run report`) — generates `exports/EXPORT-REPORT.md` with full system stats

## Phase 4: Deduplication (Merged into Phase 2)

Deduplication is now part of the Phase 2 pipeline via `npm run dedup`.
Advanced merge/archive tooling is Phase 5+.

## Phase 5: Automation (Future)

- GitHub repository scraping
- PDF extraction pipeline
- Conversation import pipeline
- AI-assisted classification
- Prompt-based ingestion
