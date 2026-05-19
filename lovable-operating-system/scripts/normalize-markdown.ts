#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import glob from "fast-glob";

export function normalizeMarkdown(content: string): string {
  let normalized = content;

  // Normalize line endings
  normalized = normalized.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Remove trailing whitespace on each line
  normalized = normalized.replace(/[ \t]+$/gm, "");

  // Ensure single newline at end of file
  normalized = normalized.trimEnd() + "\n";

  // Collapse more than 2 consecutive blank lines to 2
  normalized = normalized.replace(/\n{3,}/g, "\n\n");

  // Normalize ATX headers to have a space after #
  normalized = normalized.replace(/^(#{1,6})([^ #\n])/gm, "$1 $2");

  return normalized;
}

async function normalizeAllMarkdown(rootDir: string): Promise<void> {
  const files = await glob("**/*.md", { cwd: rootDir, absolute: true, ignore: ["**/node_modules/**"] });

  let count = 0;
  for (const file of files) {
    const original = fs.readFileSync(file, "utf-8");
    const normalized = normalizeMarkdown(original);
    if (original !== normalized) {
      fs.writeFileSync(file, normalized);
      console.log(`Normalized: ${path.relative(rootDir, file)}`);
      count++;
    }
  }
  console.log(`\nDone. ${count} file(s) normalized.`);
}

if (require.main === module) {
  const rootDir = path.join(__dirname, "..");
  normalizeAllMarkdown(rootDir).catch(console.error);
}
