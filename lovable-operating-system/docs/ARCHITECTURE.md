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

## Phase 2: Processing (Planned)

- Normalize markdown
- Extract metadata
- Classify by category
- Tag and enrich

## Phase 3: Deduplication (Planned)

- Jaccard similarity comparison
- Near-duplicate detection
- Merge or archive duplicates

## Phase 4: Packaging (Planned)

- Generate SKILL.md from processed sources
- ZIP packaging for Lovable imports
- Export manifests

## Phase 5: Automation (Future)

- GitHub repository scraping
- PDF extraction pipeline
- Conversation import pipeline
- AI-assisted classification
- Prompt-based ingestion
