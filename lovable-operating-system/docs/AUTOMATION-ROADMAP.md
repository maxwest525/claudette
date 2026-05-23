# Automation Roadmap

## Phase 1 — Local Scripts (Active)
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

## Phase 2 — GitHub Actions (Active)
- ✅ Auto-validate on every push/PR (`validate.yml`)
- ✅ Auto-package + release on version tag (`package-on-tag.yml`)
- ✅ PR skill check with duplicate detection (`pr-skill-check.yml`)
- ✅ Nightly pipeline: Phase 2 + Phase 3 + commit outputs (`nightly-pipeline.yml`)
- ✅ PR template with skill checklist

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
