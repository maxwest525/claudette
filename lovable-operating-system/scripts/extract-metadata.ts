#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";

export interface ExtractedMetadata {
  file: string;
  frontmatter: Record<string, unknown>;
  title: string | null;
  word_count: number;
  has_code_blocks: boolean;
  headings: string[];
}

export function extractMetadata(filePath: string): ExtractedMetadata {
  const content = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(content);

  const headingMatches = parsed.content.match(/^#{1,6} .+$/gm) || [];
  const h1Match = parsed.content.match(/^# (.+)$/m);
  const title = h1Match ? h1Match[1] : null;
  const wordCount = parsed.content.split(/\s+/).filter(Boolean).length;
  const hasCodeBlocks = /```/.test(parsed.content);

  return {
    file: filePath,
    frontmatter: parsed.data,
    title,
    word_count: wordCount,
    has_code_blocks: hasCodeBlocks,
    headings: headingMatches,
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.error("Usage: ts-node extract-metadata.ts <file-path>");
    process.exit(1);
  }
  const result = extractMetadata(args[0]);
  console.log(JSON.stringify(result, null, 2));
}
