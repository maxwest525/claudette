#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";

const ROOT = path.join(__dirname, "..");
const PROCESSED_INDEX_PATH = path.join(ROOT, "processed", "processed-index.json");
const SOURCE_TRACKER_PATH = path.join(ROOT, "raw-ingestion", "sources", "source-tracker.json");
const DUPLICATES_DIR = path.join(ROOT, "duplicates");

interface DuplicateRecord {
  type: "url" | "hash" | "jaccard";
  item_a: string;
  item_b: string;
  score: number;
  reason: string;
  recommended_action: "keep-a" | "keep-b" | "merge" | "review";
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean)
  );
}

function detectUrlDuplicates(trackerPath: string): DuplicateRecord[] {
  if (!fs.existsSync(trackerPath)) return [];
  const records: { id: string; origin_url?: string; title: string }[] = JSON.parse(
    fs.readFileSync(trackerPath, "utf-8")
  );
  const seen = new Map<string, string>();
  const dupes: DuplicateRecord[] = [];

  for (const r of records) {
    if (!r.origin_url) continue;
    const normalized = r.origin_url.replace(/\/$/, "").toLowerCase();
    if (seen.has(normalized)) {
      dupes.push({
        type: "url",
        item_a: seen.get(normalized)!,
        item_b: r.id,
        score: 1.0,
        reason: `Identical URL: ${r.origin_url}`,
        recommended_action: "keep-a",
      });
    } else {
      seen.set(normalized, r.id);
    }
  }
  return dupes;
}

function detectHashDuplicates(items: { id: string; title: string; content_hash: string }[]): DuplicateRecord[] {
  const seen = new Map<string, string>();
  const dupes: DuplicateRecord[] = [];

  for (const item of items) {
    if (seen.has(item.content_hash)) {
      dupes.push({
        type: "hash",
        item_a: seen.get(item.content_hash)!,
        item_b: item.id,
        score: 1.0,
        reason: `Identical content hash: ${item.content_hash}`,
        recommended_action: "keep-a",
      });
    } else {
      seen.set(item.content_hash, item.id);
    }
  }
  return dupes;
}

function detectJaccardDuplicates(
  items: { id: string; title: string; normalized_path: string }[],
  threshold = 0.6
): DuplicateRecord[] {
  const dupes: DuplicateRecord[] = [];
  const tokenCache = new Map<string, Set<string>>();

  for (const item of items) {
    if (!fs.existsSync(item.normalized_path)) continue;
    const content = fs.readFileSync(item.normalized_path, "utf-8");
    tokenCache.set(item.id, tokenize(content));
  }

  const ids = [...tokenCache.keys()];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const score = jaccardSimilarity(tokenCache.get(ids[i])!, tokenCache.get(ids[j])!);
      if (score >= threshold) {
        const action: DuplicateRecord["recommended_action"] = score >= 0.9 ? "keep-a" : "review";
        dupes.push({
          type: "jaccard",
          item_a: ids[i],
          item_b: ids[j],
          score: Math.round(score * 100) / 100,
          reason: `Jaccard similarity: ${Math.round(score * 100)}%`,
          recommended_action: action,
        });
      }
    }
  }
  return dupes;
}

function generateMarkdownReport(dupes: DuplicateRecord[]): string {
  if (dupes.length === 0) return "# Deduplication Report\n\nNo duplicates found.\n";

  const byType = {
    url: dupes.filter((d) => d.type === "url"),
    hash: dupes.filter((d) => d.type === "hash"),
    jaccard: dupes.filter((d) => d.type === "jaccard"),
  };

  let md = `# Deduplication Report\n\nGenerated: ${new Date().toISOString()}\n\n`;
  md += `**Total duplicates found: ${dupes.length}**\n\n`;
  md += `| Type | Count |\n|------|-------|\n`;
  md += `| URL exact | ${byType.url.length} |\n`;
  md += `| Content hash exact | ${byType.hash.length} |\n`;
  md += `| Near-duplicate (Jaccard) | ${byType.jaccard.length} |\n\n`;

  for (const [type, records] of Object.entries(byType)) {
    if (records.length === 0) continue;
    md += `## ${type === "url" ? "URL Exact Duplicates" : type === "hash" ? "Content Hash Exact Duplicates" : "Near-Duplicates (Jaccard)"}\n\n`;
    for (const d of records) {
      md += `- **${d.item_a}** ↔ **${d.item_b}**\n`;
      md += `  - Score: ${d.score} | ${d.reason}\n`;
      md += `  - Action: \`${d.recommended_action}\`\n\n`;
    }
  }

  return md;
}

function main(): void {
  fs.mkdirSync(DUPLICATES_DIR, { recursive: true });

  let items: { id: string; title: string; content_hash: string; normalized_path: string }[] = [];
  if (fs.existsSync(PROCESSED_INDEX_PATH)) {
    const index = JSON.parse(fs.readFileSync(PROCESSED_INDEX_PATH, "utf-8"));
    items = index.items || [];
  }

  console.log("Running deduplication pipeline...\n");

  const urlDupes = detectUrlDuplicates(SOURCE_TRACKER_PATH);
  console.log(`Pass 1 (URL exact):    ${urlDupes.length} duplicate(s)`);

  const hashDupes = detectHashDuplicates(items);
  console.log(`Pass 2 (Hash exact):   ${hashDupes.length} duplicate(s)`);

  const jaccardDupes = detectJaccardDuplicates(items);
  console.log(`Pass 3 (Jaccard near): ${jaccardDupes.length} duplicate(s)`);

  const allDupes = [...urlDupes, ...hashDupes, ...jaccardDupes];

  const reportJsonPath = path.join(DUPLICATES_DIR, "dedup-report.json");
  const reportMdPath = path.join(DUPLICATES_DIR, "dedup-report.md");

  fs.writeFileSync(reportJsonPath, JSON.stringify({ generated_at: new Date().toISOString(), total: allDupes.length, duplicates: allDupes }, null, 2));
  fs.writeFileSync(reportMdPath, generateMarkdownReport(allDupes));

  // Mark duplicates in processed index
  if (hashDupes.length > 0 && items.length > 0) {
    const index = JSON.parse(fs.readFileSync(PROCESSED_INDEX_PATH, "utf-8"));
    for (const d of hashDupes) {
      const item = index.items.find((i: { id: string }) => i.id === d.item_b);
      if (item) {
        item.status = "duplicate";
        item.duplicate_of = d.item_a;
      }
    }
    fs.writeFileSync(PROCESSED_INDEX_PATH, JSON.stringify(index, null, 2));
  }

  console.log(`\nReport: ${reportMdPath}`);
  console.log(`Total:  ${allDupes.length} duplicate(s) found`);
}

main();
