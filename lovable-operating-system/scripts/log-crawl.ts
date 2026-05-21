#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

type CrawlStatus = "running" | "completed" | "failed" | "partial";

interface CrawlLogEntry {
  crawl_id: string;
  started_at: string;
  completed_at?: string;
  status: CrawlStatus;
  source_type: string;
  target: string;
  files_collected: number;
  errors: string[];
  notes?: string;
}

const CRAWL_LOG_PATH = path.join(__dirname, "..", "raw-ingestion", "crawl-log.json");

function readCrawlLog(): CrawlLogEntry[] {
  if (!fs.existsSync(CRAWL_LOG_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(CRAWL_LOG_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function writeCrawlLog(entries: CrawlLogEntry[]): void {
  fs.mkdirSync(path.dirname(CRAWL_LOG_PATH), { recursive: true });
  fs.writeFileSync(CRAWL_LOG_PATH, JSON.stringify(entries, null, 2));
}

export function startCrawl(sourceType: string, target: string, notes?: string): string {
  const crawlId = uuidv4();
  const entry: CrawlLogEntry = {
    crawl_id: crawlId,
    started_at: new Date().toISOString(),
    status: "running",
    source_type: sourceType,
    target,
    files_collected: 0,
    errors: [],
    notes,
  };
  const log = readCrawlLog();
  log.push(entry);
  writeCrawlLog(log);
  console.log(`Crawl started: ${crawlId}`);
  return crawlId;
}

export function completeCrawl(crawlId: string, filesCollected: number, status: CrawlStatus = "completed", errors: string[] = []): void {
  const log = readCrawlLog();
  const entry = log.find((e) => e.crawl_id === crawlId);
  if (!entry) {
    console.error(`Crawl ID not found: ${crawlId}`);
    return;
  }
  entry.completed_at = new Date().toISOString();
  entry.status = status;
  entry.files_collected = filesCollected;
  entry.errors = errors;
  writeCrawlLog(log);
  console.log(`Crawl completed: ${crawlId} | Status: ${status} | Files: ${filesCollected}`);
}

if (require.main === module) {
  const [command, ...args] = process.argv.slice(2);
  if (command === "start" && args[0] && args[1]) {
    startCrawl(args[0], args[1], args[2]);
  } else if (command === "complete" && args[0]) {
    completeCrawl(args[0], parseInt(args[1] || "0"), (args[2] as CrawlStatus) || "completed");
  } else {
    console.error("Usage:");
    console.error("  ts-node log-crawl.ts start <source-type> <target> [notes]");
    console.error("  ts-node log-crawl.ts complete <crawl-id> <files-count> [status]");
  }
}
