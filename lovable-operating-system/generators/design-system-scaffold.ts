#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

interface DesignSystemScaffoldOptions {
  name: string;
  framework?: string;
  tags?: string[];
  author?: string;
}

export function generateDesignSystemScaffold(
  options: DesignSystemScaffoldOptions,
  outputDir: string
): void {
  const { name, framework = "unknown", tags = [], author = "unknown" } = options;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const systemDir = path.join(outputDir, slug);

  if (fs.existsSync(systemDir)) {
    throw new Error(`Design system folder already exists: ${systemDir}`);
  }

  const lovableDir = path.join(systemDir, ".lovable");
  const rulesDir = path.join(lovableDir, "rules");
  fs.mkdirSync(rulesDir, { recursive: true });

  const now = new Date().toISOString();
  const id = uuidv4();

  const systemMd = `# ${name} Design System

This is the central design system configuration for ${name}.

## Purpose

_Describe the purpose and scope of this design system._

## Usage

_How to use components from this design system._
`;

  const componentsRule = `# Component Rules

_Define component usage rules here._
`;

  const stylingRule = `# Styling Rules

_Define styling rules here._
`;

  const tokensRule = `# Token Rules

_Define design token rules here._
`;

  const metadata = {
    id,
    title: name,
    type: "design-system",
    source: "manual",
    tags: [...tags],
    created_at: now,
    updated_at: now,
    status: "draft",
    validation_status: "pending",
    framework,
    author,
    has_system_md: true,
    has_rules_dir: true,
    components_count: 0,
    tokens_count: 0,
    duplicate_score: 0,
  };

  fs.writeFileSync(path.join(lovableDir, "system.md"), systemMd);
  fs.writeFileSync(path.join(rulesDir, "components.md"), componentsRule);
  fs.writeFileSync(path.join(rulesDir, "styling.md"), stylingRule);
  fs.writeFileSync(path.join(rulesDir, "tokens.md"), tokensRule);
  fs.writeFileSync(path.join(systemDir, "components.md"), "# Components\n\n_Document components here._\n");
  fs.writeFileSync(path.join(systemDir, "styling.md"), "# Styling\n\n_Document styling here._\n");
  fs.writeFileSync(path.join(systemDir, "tokens.md"), "# Design Tokens\n\n_Document tokens here._\n");
  fs.writeFileSync(path.join(systemDir, "patterns.md"), "# Patterns\n\n_Document patterns here._\n");
  fs.writeFileSync(path.join(systemDir, "metadata.json"), JSON.stringify(metadata, null, 2));

  console.log(`Design system scaffold created: ${systemDir}`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.error("Usage: ts-node design-system-scaffold.ts <name> [framework]");
    process.exit(1);
  }
  const [name, framework] = args;
  const outputDir = path.join(__dirname, "..", "design-systems");
  generateDesignSystemScaffold({ name, framework }, outputDir);
}
