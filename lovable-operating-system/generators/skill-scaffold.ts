#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

interface SkillScaffoldOptions {
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  author?: string;
}

export function generateSkillScaffold(
  options: SkillScaffoldOptions,
  outputDir: string
): void {
  const { name, description, category = "general", tags = [], author = "unknown" } = options;

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    throw new Error(`Skill name "${name}" must be lowercase-hyphen format`);
  }
  if (!description.startsWith("Use when")) {
    throw new Error('Description must start with "Use when"');
  }

  const skillDir = path.join(outputDir, name);
  if (fs.existsSync(skillDir)) {
    throw new Error(`Skill folder already exists: ${skillDir}`);
  }
  fs.mkdirSync(skillDir, { recursive: true });

  const now = new Date().toISOString();
  const id = uuidv4();

  const skillMd = `# ${name}

${description}

## Overview

_Describe what this skill does and its primary use case._

## Instructions

1. Step one
2. Step two
3. Step three

## Examples

\`\`\`
Example usage here
\`\`\`

## Notes

_Any additional notes, constraints, or considerations._
`;

  const metadata = {
    id,
    title: name,
    type: "skill",
    skill_name: name,
    source: "manual",
    tags: [category, ...tags],
    created_at: now,
    updated_at: now,
    status: "draft",
    install_method: "zip-import",
    validation_status: "pending",
    use_when: description,
    category,
    author,
    lovable_compatible: true,
    bundled_files: ["SKILL.md"],
    duplicate_score: 0,
  };

  fs.writeFileSync(path.join(skillDir, "SKILL.md"), skillMd);
  fs.writeFileSync(
    path.join(skillDir, "metadata.json"),
    JSON.stringify(metadata, null, 2)
  );

  console.log(`Skill scaffold created: ${skillDir}`);
  console.log(`  - SKILL.md`);
  console.log(`  - metadata.json`);
}

// CLI entrypoint
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: ts-node skill-scaffold.ts <skill-name> <use-when-description> [category]");
    process.exit(1);
  }
  const [name, description, category] = args;
  const outputDir = path.join(__dirname, "..", "skills");
  generateSkillScaffold({ name, description, category }, outputDir);
}
