#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

type KnowledgeType = "workspace" | "project";

interface KnowledgeScaffoldOptions {
  title: string;
  type: KnowledgeType;
  category?: string;
  tags?: string[];
  author?: string;
  projectId?: string;
  workspaceId?: string;
}

export function generateKnowledgeScaffold(
  options: KnowledgeScaffoldOptions,
  outputDir: string
): void {
  const {
    title,
    type,
    category = "general",
    tags = [],
    author = "unknown",
    projectId,
    workspaceId,
  } = options;

  const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const fileName = `${slug}.md`;
  const filePath = path.join(outputDir, fileName);

  if (fs.existsSync(filePath)) {
    throw new Error(`Knowledge file already exists: ${filePath}`);
  }

  const now = new Date().toISOString();
  const id = uuidv4();

  const content = `---
id: ${id}
title: "${title}"
type: "${type}-knowledge"
category: "${category}"
tags: [${tags.map((t) => `"${t}"`).join(", ")}]
author: "${author}"
created_at: "${now}"
updated_at: "${now}"
status: "draft"
validation_status: "pending"
${type === "project" && projectId ? `project_id: "${projectId}"` : ""}
${type === "workspace" && workspaceId ? `workspace_id: "${workspaceId}"` : ""}
---

# ${title}

_Brief summary of what this knowledge covers._

## Context

_Why this knowledge exists and when to apply it._

## Content

_Main knowledge content here._

## Examples

_Optional examples._

## References

_Optional links or source references._
`;

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(filePath, content);

  console.log(`Knowledge scaffold created: ${filePath}`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: ts-node knowledge-scaffold.ts <title> <workspace|project> [category]");
    process.exit(1);
  }
  const [title, type, category] = args;
  if (type !== "workspace" && type !== "project") {
    console.error("Type must be 'workspace' or 'project'");
    process.exit(1);
  }
  const baseDir = type === "workspace"
    ? path.join(__dirname, "..", "workspace-knowledge")
    : path.join(__dirname, "..", "project-knowledge");
  generateKnowledgeScaffold({ title, type, category }, baseDir);
}
