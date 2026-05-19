# Packaging Roadmap

## Current: ZIP Packaging
- `npm run package:skill <skill-name>` creates a ZIP
- ZIP contains SKILL.md + metadata.json + any bundled files
- Output to `exports/`

## Planned: Batch Packaging
- Package all validated skills at once
- Version-stamped export bundles
- Manifest generation for each bundle

## Planned: Lovable Import Format
- Research Lovable's expected import structure
- Ensure SKILL.md naming conventions match
- Validate ZIP structure before export

## Planned: Design System Export
- Bundle `.lovable/` directory
- Include component docs
- Include token exports

## Planned: Knowledge Export
- Bundle workspace knowledge sets
- Respect 50KB size limits
- Chunked exports for large sets

## Planned: GitHub Release Publishing
- Tag-based versioning
- Automated release notes from metadata
- Asset upload to GitHub releases
