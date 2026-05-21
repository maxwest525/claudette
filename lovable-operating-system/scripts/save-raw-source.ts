#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

type OriginType = "web" | "github" | "pdf" | "conversation" | "manual" | "api";
type RawFormat = "html" | "markdown" | "text" | "pdf" | "json";

interface SaveRawSourceOptions {
  content: string;
  originType: OriginType;
  rawFormat: RawFormat;
  originUrl?: string;
  title?: string;
  tags?: string[];
  crawlId?: string;
}

export function saveRawSource(options: SaveRawSourceOptions): string {
  const {
    content,
    originType,
    rawFormat,
    originUrl,
    title = "untitled",
    tags = [],
    crawlId,
  } = options;

  const id = uuidv4();
  const now = new Date().toISOString();
  const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60);

  const formatToDir: Record<RawFormat, string> = {
    html: "html",
    markdown: "markdown",
    text: "text",
    pdf: "pdfs",
    json: "text",
  };

  const formatToExt: Record<RawFormat, string> = {
    html: "html",
    markdown: "md",
    text: "txt",
    pdf: "pdf",
    json: "json",
  };

  const subDir = path.join(__dirname, "..", "raw-ingestion", formatToDir[rawFormat]);
  fs.mkdirSync(subDir, { recursive: true });

  const fileName = `${slug}-${id.slice(0, 8)}.${formatToExt[rawFormat]}`;
  const filePath = path.join(subDir, fileName);
  fs.writeFileSync(filePath, content);

  const metaPath = filePath + ".meta.json";
  const meta = {
    id,
    title,
    type: "raw-source",
    origin_type: originType,
    origin_url: originUrl,
    raw_format: rawFormat,
    file_path: filePath,
    size_bytes: Buffer.byteLength(content),
    collected_at: now,
    tags,
    crawl_id: crawlId,
    processed: false,
    source: originUrl || "manual",
    created_at: now,
    updated_at: now,
    status: "draft",
    validation_status: "pending",
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

  console.log(`Saved raw source: ${filePath}`);
  console.log(`Metadata:        ${metaPath}`);

  return filePath;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error("Usage: ts-node save-raw-source.ts <file-path> <origin-type> <raw-format> [title] [url]");
    process.exit(1);
  }
  const [filePath, originType, rawFormat, title, originUrl] = args;
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, "utf-8");
  saveRawSource({
    content,
    originType: originType as OriginType,
    rawFormat: rawFormat as RawFormat,
    originUrl,
    title,
  });
}
