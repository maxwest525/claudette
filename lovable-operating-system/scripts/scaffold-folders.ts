#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";

const FOLDERS = [
  "workspace-knowledge",
  "project-knowledge",
  "skills",
  "design-systems",
  "templates",
  "scripts",
  "schemas",
  "generators",
  "validators",
  "imports/drop-zone",
  "exports",
  "raw-ingestion/sources",
  "raw-ingestion/html",
  "raw-ingestion/markdown",
  "raw-ingestion/text",
  "raw-ingestion/pdfs",
  "raw-ingestion/conversations",
  "processed",
  "duplicates",
  "archive",
  "docs",
];

function scaffoldFolders(rootDir: string): void {
  console.log(`Scaffolding folders in: ${rootDir}\n`);
  for (const folder of FOLDERS) {
    const fullPath = path.join(rootDir, folder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      fs.writeFileSync(path.join(fullPath, ".gitkeep"), "");
      console.log(`Created: ${folder}/`);
    } else {
      console.log(`Exists:  ${folder}/`);
    }
  }
  console.log("\nDone.");
}

if (require.main === module) {
  const rootDir = path.join(__dirname, "..");
  scaffoldFolders(rootDir);
}
