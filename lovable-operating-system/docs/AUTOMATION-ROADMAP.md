# Automation Roadmap

## Phase 1 — Local Scripts (Now)
All automation runs locally via npm scripts.

| Script | Command |
|--------|---------|
| Validate all | `npm run validate` |
| Generate skill | `npm run generate:skill` |
| Package skill | `npm run package:skill` |
| Detect duplicates | `npm run dedupe` |
| Normalize markdown | `npm run normalize` |
| Index sources | `npm run ingest:index` |
| Save raw source | `npm run ingest:save` |
| Track source | `npm run source:track` |

## Phase 2 — GitHub Actions (Planned)
- Auto-validate on push
- Auto-package on tag
- PR-based skill review
- Duplicate check on new skill PRs

## Phase 3 — Scheduled Ingestion (Future)
- Nightly crawl from tracked source list
- Weekly deduplication run
- Monthly archive of inactive skills

## Phase 4 — API Integration (Future)
- REST API for skill queries
- Webhook triggers for Lovable imports
- Real-time sync with Lovable workspace

## Phase 5 — AI Pipeline (Future)
- LLM-based skill quality review
- Auto-draft SKILL.md from raw sources
- Semantic deduplication
- Gap analysis and skill recommendations
