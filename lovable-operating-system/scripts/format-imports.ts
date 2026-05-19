#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

interface ImportItem {
  id: string;
  file: string;
  type: string;
  size_bytes: number;
  imported_at: string;
  status: "pending" | "processed" | "failed";
}

export function processDropZone(): ImportItem[] {
  const dropZone = path.join(__dirname, "..", "imports", "drop-zone");
  const logPath = path.join(__dirname, "..", "imports", "import-log.json");

  if (!fs.existsSync(dropZone)) {
    console.log("Drop zone not found.");
    return [];
  }

  const files = fs.readdirSync(dropZone).filter((f) => f !== ".gitkeep");
  if (files.length === 0) {
    console.log("Drop zone is empty.");
    return [];
  }

  const items: ImportItem[] = [];
  const now = new Date().toISOString();

  for (const file of files) {
    const filePath = path.join(dropZone, file);
    const stats = fs.statSync(filePath);
    const ext = path.extname(file).toLowerCase();

    let type = "unknown";
    if (ext === ".md") type = "markdown";
    else if (ext === ".html" || ext === ".htm") type = "html";
    else if (ext === ".pdf") type = "pdf";
    else if (ext === ".json") type = "json";
    else if (ext === ".txt") type = "text";

    items.push({
      id: uuidv4(),
      file,
      type,
      size_bytes: stats.size,
      imported_at: now,
      status: "pending",
    });
  }

  // Save log
  let existingLog: ImportItem[] = [];
  if (fs.existsSync(logPath)) {
    try {
      existingLog = JSON.parse(fs.readFileSync(logPath, "utf-8"));
    } catch { /* ignore */ }
  }

  fs.writeFileSync(logPath, JSON.stringify([...existingLog, ...items], null, 2));
  console.log(`Logged ${items.length} import item(s) to: ${logPath}`);
  return items;
}

if (require.main === module) {
  processDropZone();
}
