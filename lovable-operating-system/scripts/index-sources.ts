#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

interface SourceIndexEntry {
  id: string;
  title: string;
  origin_type: string;
  origin_url?: string;
  raw_format: string;
  file_path: string;
  size_bytes: number;
  crawl_id?: string;
  collected_at: string;
  tags: string[];
  processed: boolean;
  processed_at?: string;
  notes?: string;
}

interface SourceIndex {
  version: string;
  last_updated: string;
  total_sources: number;
  sources: SourceIndexEntry[];
}

const RAW_DIR = path.join(__dirname, "..", "raw-ingestion");
const INDEX_PATH = path.join(RAW_DIR, "source-index.json");

function scanRawIngestion(): SourceIndexEntry[] {
  const subDirs = ["html", "markdown", "text", "pdfs", "conversations"];
  const entries: SourceIndexEntry[] = [];

  for (const subDir of subDirs) {
    const fullDir = path.join(RAW_DIR, subDir);
    if (!fs.existsSync(fullDir)) continue;

    const files = fs.readdirSync(fullDir).filter(
      (f) => !f.endsWith(".meta.json") && f !== ".gitkeep"
    );

    for (const file of files) {
      const filePath = path.join(fullDir, file);
      const metaPath = filePath + ".meta.json";
      const stats = fs.statSync(filePath);

      if (fs.existsSync(metaPath)) {
        try {
          const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
          entries.push(meta as SourceIndexEntry);
          continue;
        } catch { /* fall through to basic entry */ }
      }

      entries.push({
        id: uuidv4(),
        title: path.basename(file, path.extname(file)),
        origin_type: "manual",
        raw_format: subDir === "html" ? "html" : subDir === "markdown" ? "markdown" : subDir === "pdfs" ? "pdf" : "text",
        file_path: filePath,
        size_bytes: stats.size,
        collected_at: stats.birthtime.toISOString(),
        tags: [],
        processed: false,
      });
    }
  }

  return entries;
}

function buildSourceIndex(): void {
  const sources = scanRawIngestion();
  const index: SourceIndex = {
    version: "1.0.0",
    last_updated: new Date().toISOString(),
    total_sources: sources.length,
    sources,
  };

  fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true });
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));

  console.log(`Source index updated: ${INDEX_PATH}`);
  console.log(`Total sources indexed: ${sources.length}`);
}

if (require.main === module) {
  buildSourceIndex();
}
