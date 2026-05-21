#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";

const ROOT = path.join(__dirname, "..");

function countDirs(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).length;
}

function countFiles(dir: string, ext: string): number {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((f) => f.endsWith(ext)).length;
}

function readJsonSafe<T>(filePath: string, fallback: T): T {
  if (!fs.existsSync(filePath)) return fallback;
  try { return JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch { return fallback; }
}

function main(): void {
  const now = new Date().toISOString();

  const skillsCount = countDirs(path.join(ROOT, "skills"));
  const wsKnowledgeCount = countFiles(path.join(ROOT, "workspace-knowledge"), ".md");
  const projKnowledgeCount = countFiles(path.join(ROOT, "project-knowledge"), ".md");
  const dsCount = countDirs(path.join(ROOT, "design-systems"));
  const templatesCount = countDirs(path.join(ROOT, "templates"));

  const sourceIndex = readJsonSafe<{ total_sources: number; sources: { processed: boolean }[] }>(
    path.join(ROOT, "raw-ingestion", "source-index.json"),
    { total_sources: 0, sources: [] }
  );
  const processedIndex = readJsonSafe<{ total_items: number; items: { type: string; status: string; skill_candidate_score: number }[] }>(
    path.join(ROOT, "processed", "processed-index.json"),
    { total_items: 0, items: [] }
  );
  const candidates = readJsonSafe<{ total: number }>(
    path.join(ROOT, "processed", "skill-candidates.json"),
    { total: 0 }
  );
  const dedupReport = readJsonSafe<{ total: number }>(
    path.join(ROOT, "duplicates", "dedup-report.json"),
    { total: 0 }
  );

  const skillZips = countFiles(path.join(ROOT, "exports"), ".zip");
  const bundles = countFiles(path.join(ROOT, "exports", "bundles"), ".zip");

  const processedByStatus: Record<string, number> = {};
  for (const item of processedIndex.items) {
    processedByStatus[item.status] = (processedByStatus[item.status] || 0) + 1;
  }

  const processedByType: Record<string, number> = {};
  for (const item of processedIndex.items) {
    processedByType[item.type] = (processedByType[item.type] || 0) + 1;
  }

  let md = `# Lovable OS Export Report\n\nGenerated: ${now}\n\n`;

  md += `## Repository Summary\n\n`;
  md += `| Category | Count |\n|----------|-------|\n`;
  md += `| Skills | ${skillsCount} |\n`;
  md += `| Workspace Knowledge | ${wsKnowledgeCount} |\n`;
  md += `| Project Knowledge | ${projKnowledgeCount} |\n`;
  md += `| Design Systems | ${dsCount} |\n`;
  md += `| Templates | ${templatesCount} |\n\n`;

  md += `## Pipeline Status\n\n`;
  md += `| Stage | Count |\n|-------|-------|\n`;
  md += `| Raw Sources | ${sourceIndex.total_sources} |\n`;
  md += `| Processed Items | ${processedIndex.total_items} |\n`;
  md += `| Skill Candidates | ${candidates.total} |\n`;
  md += `| Duplicates Found | ${dedupReport.total} |\n\n`;

  if (processedIndex.total_items > 0) {
    md += `## Processed Items by Type\n\n`;
    md += `| Type | Count |\n|------|-------|\n`;
    for (const [type, count] of Object.entries(processedByType)) {
      md += `| ${type} | ${count} |\n`;
    }
    md += `\n`;

    md += `## Processed Items by Status\n\n`;
    md += `| Status | Count |\n|--------|-------|\n`;
    for (const [status, count] of Object.entries(processedByStatus)) {
      md += `| ${status} | ${count} |\n`;
    }
    md += `\n`;
  }

  md += `## Exports\n\n`;
  md += `| Type | Count |\n|------|-------|\n`;
  md += `| Skill ZIPs | ${skillZips} |\n`;
  md += `| Bundle ZIPs | ${bundles} |\n\n`;

  const reportPath = path.join(ROOT, "exports", "EXPORT-REPORT.md");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, md);

  console.log(md);
  console.log(`Report saved: ${reportPath}`);
}

main();
