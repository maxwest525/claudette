#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import matter from "gray-matter";

const ROOT = path.join(__dirname, "..");
const RAW_DIR = path.join(ROOT, "raw-ingestion");
const PROCESSED_DIR = path.join(ROOT, "processed");
const SOURCE_INDEX_PATH = path.join(RAW_DIR, "source-index.json");
const PROCESSED_INDEX_PATH = path.join(PROCESSED_DIR, "processed-index.json");

interface SourceEntry {
  id: string;
  title: string;
  origin_type: string;
  raw_format: string;
  file_path: string;
  size_bytes: number;
  collected_at: string;
  tags: string[];
  processed: boolean;
  processed_at?: string;
}

interface SourceIndex {
  version: string;
  last_updated: string;
  total_sources: number;
  sources: SourceEntry[];
}

interface ProcessedItem {
  id: string;
  source_id: string;
  title: string;
  type: "skill-candidate" | "knowledge-candidate" | "reference" | "noise";
  category: string;
  tags: string[];
  word_count: number;
  char_count: number;
  has_code_blocks: boolean;
  heading_count: number;
  content_hash: string;
  skill_candidate_score: number;
  quality_score: number;
  normalized_path: string;
  original_path: string;
  processed_at: string;
  status: "processed" | "enriched" | "promoted" | "archived" | "duplicate";
  notes?: string;
}

interface ProcessedIndex {
  version: string;
  last_updated: string;
  total_items: number;
  items: ProcessedItem[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeMarkdown(content: string): string {
  let s = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  s = s.replace(/[ \t]+$/gm, "");
  s = s.replace(/\n{3,}/g, "\n\n");
  s = s.replace(/^(#{1,6})([^ #\n])/gm, "$1 $2");
  return s.trimEnd() + "\n";
}

function contentHash(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex");
}

function extractStats(content: string) {
  const headings = (content.match(/^#{1,6} .+$/gm) || []).length;
  const h1 = content.match(/^# (.+)$/m);
  const title = h1 ? h1[1].trim() : null;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const hasCodeBlocks = /```/.test(content);
  return { headings, title, wordCount, hasCodeBlocks };
}

function computeQualityScore(wordCount: number, headings: number, hasCodeBlocks: boolean): number {
  let score = 0;
  if (wordCount > 50) score += 0.2;
  if (wordCount > 200) score += 0.2;
  if (wordCount > 500) score += 0.1;
  if (headings > 0) score += 0.2;
  if (headings > 2) score += 0.1;
  if (hasCodeBlocks) score += 0.2;
  return Math.min(1, score);
}

function computeSkillCandidateScore(content: string, wordCount: number, hasCodeBlocks: boolean): number {
  const lower = content.toLowerCase();
  let score = 0;
  if (lower.includes("use when")) score += 0.3;
  if (lower.includes("how to")) score += 0.1;
  if (lower.includes("step") || lower.includes("instruction")) score += 0.1;
  if (hasCodeBlocks) score += 0.2;
  if (wordCount > 100 && wordCount < 2000) score += 0.2;
  if (lower.includes("example")) score += 0.1;
  return Math.min(1, score);
}

function determineType(skillScore: number, qualityScore: number): ProcessedItem["type"] {
  if (skillScore >= 0.5) return "skill-candidate";
  if (qualityScore >= 0.4) return "knowledge-candidate";
  if (qualityScore >= 0.2) return "reference";
  return "noise";
}

function readProcessedIndex(): ProcessedIndex {
  if (!fs.existsSync(PROCESSED_INDEX_PATH)) {
    return { version: "1.0.0", last_updated: new Date().toISOString(), total_items: 0, items: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(PROCESSED_INDEX_PATH, "utf-8"));
  } catch {
    return { version: "1.0.0", last_updated: new Date().toISOString(), total_items: 0, items: [] };
  }
}

function writeProcessedIndex(index: ProcessedIndex): void {
  fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  index.last_updated = new Date().toISOString();
  index.total_items = index.items.length;
  fs.writeFileSync(PROCESSED_INDEX_PATH, JSON.stringify(index, null, 2));
}

function processSource(source: SourceEntry): ProcessedItem | null {
  if (!fs.existsSync(source.file_path)) {
    console.warn(`  SKIP: file not found: ${source.file_path}`);
    return null;
  }

  const raw = fs.readFileSync(source.file_path, "utf-8");
  let content = raw;

  if (source.raw_format === "html") {
    content = stripHtml(raw);
  }

  // Strip frontmatter for stats, keep full content for output
  let bodyContent = content;
  try {
    const parsed = matter(content);
    bodyContent = parsed.content;
  } catch { /* ignore */ }

  const normalized = normalizeMarkdown(bodyContent);
  const { headings, title, wordCount, hasCodeBlocks } = extractStats(normalized);
  const hash = contentHash(normalized);
  const qualityScore = computeQualityScore(wordCount, headings, hasCodeBlocks);
  const skillScore = computeSkillCandidateScore(normalized, wordCount, hasCodeBlocks);
  const type = determineType(skillScore, qualityScore);

  const id = uuidv4();
  const now = new Date().toISOString();
  const normalizedFileName = `${id}.md`;
  const normalizedPath = path.join(PROCESSED_DIR, normalizedFileName);

  fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  fs.writeFileSync(normalizedPath, normalized);

  const item: ProcessedItem = {
    id,
    source_id: source.id,
    title: title || source.title || path.basename(source.file_path, path.extname(source.file_path)),
    type,
    category: "uncategorized",
    tags: [...source.tags],
    word_count: wordCount,
    char_count: normalized.length,
    has_code_blocks: hasCodeBlocks,
    heading_count: headings,
    content_hash: hash,
    skill_candidate_score: Math.round(skillScore * 100) / 100,
    quality_score: Math.round(qualityScore * 100) / 100,
    normalized_path: normalizedPath,
    original_path: source.file_path,
    processed_at: now,
    status: "processed",
  };

  fs.writeFileSync(normalizedPath + ".meta.json", JSON.stringify(item, null, 2));
  return item;
}

function main(): void {
  if (!fs.existsSync(SOURCE_INDEX_PATH)) {
    console.log("No source-index.json found. Run `npm run ingest:index` first.");
    return;
  }

  const sourceIndex: SourceIndex = JSON.parse(fs.readFileSync(SOURCE_INDEX_PATH, "utf-8"));
  const unprocessed = sourceIndex.sources.filter((s) => !s.processed);

  if (unprocessed.length === 0) {
    console.log("No unprocessed sources found.");
    return;
  }

  console.log(`Processing ${unprocessed.length} source(s)...\n`);

  const processedIndex = readProcessedIndex();
  let count = 0;

  for (const source of unprocessed) {
    console.log(`  Processing: ${source.title || source.id}`);
    const item = processSource(source);
    if (item) {
      processedIndex.items.push(item);
      source.processed = true;
      source.processed_at = new Date().toISOString();
      console.log(`    -> ${item.type} | quality: ${item.quality_score} | skill: ${item.skill_candidate_score}`);
      count++;
    }
  }

  writeProcessedIndex(processedIndex);

  // Update source-index.json
  sourceIndex.last_updated = new Date().toISOString();
  fs.writeFileSync(SOURCE_INDEX_PATH, JSON.stringify(sourceIndex, null, 2));

  console.log(`\nDone. Processed ${count} source(s).`);
  console.log(`Processed index: ${PROCESSED_INDEX_PATH}`);
}

main();
