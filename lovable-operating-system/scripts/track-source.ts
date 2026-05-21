#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

interface SourceRecord {
  id: string;
  title: string;
  origin_type: string;
  origin_url?: string;
  tracked_at: string;
  status: "pending" | "collected" | "skipped" | "error";
  priority: "high" | "medium" | "low";
  notes?: string;
  tags: string[];
}

const TRACKER_PATH = path.join(__dirname, "..", "raw-ingestion", "sources", "source-tracker.json");

function readTracker(): SourceRecord[] {
  if (!fs.existsSync(TRACKER_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(TRACKER_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function writeTracker(records: SourceRecord[]): void {
  fs.mkdirSync(path.dirname(TRACKER_PATH), { recursive: true });
  fs.writeFileSync(TRACKER_PATH, JSON.stringify(records, null, 2));
}

export function trackSource(
  title: string,
  originType: string,
  options: { originUrl?: string; priority?: "high" | "medium" | "low"; tags?: string[]; notes?: string } = {}
): string {
  const id = uuidv4();
  const record: SourceRecord = {
    id,
    title,
    origin_type: originType,
    origin_url: options.originUrl,
    tracked_at: new Date().toISOString(),
    status: "pending",
    priority: options.priority || "medium",
    notes: options.notes,
    tags: options.tags || [],
  };

  const records = readTracker();
  records.push(record);
  writeTracker(records);

  console.log(`Source tracked: ${id} — ${title}`);
  return id;
}

export function updateSourceStatus(id: string, status: SourceRecord["status"]): void {
  const records = readTracker();
  const record = records.find((r) => r.id === id);
  if (!record) {
    console.error(`Source ID not found: ${id}`);
    return;
  }
  record.status = status;
  writeTracker(records);
  console.log(`Updated source ${id} status to: ${status}`);
}

export function listSources(filterStatus?: SourceRecord["status"]): void {
  const records = readTracker();
  const filtered = filterStatus ? records.filter((r) => r.status === filterStatus) : records;
  console.log(`Sources (${filtered.length}):\n`);
  for (const r of filtered) {
    console.log(`  [${r.status.toUpperCase()}] ${r.title} (${r.origin_type})`);
    if (r.origin_url) console.log(`    URL: ${r.origin_url}`);
  }
}

if (require.main === module) {
  const [command, ...args] = process.argv.slice(2);
  if (command === "add" && args[0] && args[1]) {
    trackSource(args[0], args[1], { originUrl: args[2], priority: (args[3] as "high" | "medium" | "low") || "medium" });
  } else if (command === "update" && args[0] && args[1]) {
    updateSourceStatus(args[0], args[1] as SourceRecord["status"]);
  } else if (command === "list") {
    listSources(args[0] as SourceRecord["status"] | undefined);
  } else {
    console.error("Usage:");
    console.error("  ts-node track-source.ts add <title> <origin-type> [url] [priority]");
    console.error("  ts-node track-source.ts update <id> <status>");
    console.error("  ts-node track-source.ts list [status]");
  }
}
