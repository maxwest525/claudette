# Lovable Operating System

A centralized repository for managing **Lovable Skills**, **Workspace Knowledge**, **Project Knowledge**, **Design Systems**, and **Templates** at scale.

---

## Quick Start

```bash
npm install
npm run scaffold:folders   # Ensure all folders exist
npm run validate           # Validate all skills and design systems
```

---

## Generate New Skill

```bash
npm run generate:skill -- my-skill-name "Use when you need to do X"
```

This creates:
```
skills/my-skill-name/
├── SKILL.md
└── metadata.json
```

---

## Generate New Knowledge

```bash
npm run generate:knowledge -- "My Knowledge Title" workspace general
```

---

## Generate Design System

```bash
npm run generate:design-system -- "My Design System" react
```

---

## Package a Skill for Import

```bash
npm run package:skill -- my-skill-name
# Output: exports/my-skill-name.zip
```

---

## Detect Duplicates

```bash
npm run dedupe               # Uses 0.6 similarity threshold
```

---

## Collect Raw Sources

```bash
# Track a source for future collection
npm run source:track -- add "My Source" web https://example.com high

# Save a raw file into ingestion
npm run ingest:save -- /path/to/file.md manual markdown "My Doc"

# Re-index all collected sources
npm run ingest:index
```

---

## Folder Structure

| Folder | Purpose |
|--------|---------|
| `workspace-knowledge/` | Workspace-level knowledge docs |
| `project-knowledge/` | Project-specific knowledge docs |
| `skills/` | Validated Lovable skills |
| `design-systems/` | Design system packages |
| `templates/` | Reusable project scaffolds |
| `scripts/` | Automation scripts |
| `schemas/` | TypeScript/Zod schemas |
| `generators/` | Scaffold generators |
| `validators/` | Validation logic |
| `imports/drop-zone/` | Drop files here for ingestion |
| `exports/` | Packaged ZIPs ready for Lovable |
| `raw-ingestion/` | Phase 1 raw source collection |
| `processed/` | Processed artifacts |
| `duplicates/` | Duplicate detection reports |
| `archive/` | Archived items |
| `docs/` | Documentation |

---

## Validation Rules

### Skills
- Name must be `lowercase-hyphen` format
- Description must start with `"Use when"`
- SKILL.md must have H1 title
- metadata.json must have all required fields

### Knowledge
- Files must be under 50KB
- Must have valid markdown structure
- Tags must be `lowercase-hyphen` format

### Design Systems
- Must have `.lovable/system.md`
- Should have `.lovable/rules/` directory
- Recommended: `components.md`, `styling.md`, `tokens.md`, `patterns.md`

---

## Roadmaps

- [Ingestion Roadmap](docs/INGESTION-ROADMAP.md)
- [Packaging Roadmap](docs/PACKAGING-ROADMAP.md)
- [Automation Roadmap](docs/AUTOMATION-ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)

---

## Phase Status

| Phase | Status |
|-------|--------|
| Phase 1: Raw Source Collection | Active |
| Phase 2: Processing & Classification | Planned |
| Phase 3: Deduplication | Planned |
| Phase 4: Packaging & Export | Partial |
| Phase 5: Automation | Future |
