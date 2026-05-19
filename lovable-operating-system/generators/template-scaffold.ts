#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

interface TemplateScaffoldOptions {
  name: string;
  scaffoldType: string;
  tags?: string[];
  author?: string;
  description?: string;
}

export function generateTemplateScaffold(
  options: TemplateScaffoldOptions,
  outputDir: string
): void {
  const { name, scaffoldType, tags = [], author = "unknown", description = "" } = options;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const templateDir = path.join(outputDir, slug);

  if (fs.existsSync(templateDir)) {
    throw new Error(`Template folder already exists: ${templateDir}`);
  }

  fs.mkdirSync(templateDir, { recursive: true });
  fs.mkdirSync(path.join(templateDir, "starter"), { recursive: true });

  const now = new Date().toISOString();
  const id = uuidv4();

  const readmeMd = `# ${name}

${description || "_Describe this template._"}

## Scaffold Type

${scaffoldType}

## Files Included

- \`starter/\` — starter project files
- \`metadata.json\` — template metadata
- \`README.md\` — this file

## Usage

_Instructions for applying this template._
`;

  const metadata = {
    id,
    title: name,
    type: "template",
    source: "manual",
    tags: [...tags],
    created_at: now,
    updated_at: now,
    status: "draft",
    validation_status: "pending",
    scaffold_type: scaffoldType,
    files_included: ["README.md", "metadata.json", "starter/"],
    author,
    description,
    duplicate_score: 0,
  };

  fs.writeFileSync(path.join(templateDir, "README.md"), readmeMd);
  fs.writeFileSync(path.join(templateDir, "metadata.json"), JSON.stringify(metadata, null, 2));
  fs.writeFileSync(path.join(templateDir, "starter", ".gitkeep"), "");

  console.log(`Template scaffold created: ${templateDir}`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: ts-node template-scaffold.ts <name> <scaffold-type>");
    process.exit(1);
  }
  const [name, scaffoldType] = args;
  const outputDir = path.join(__dirname, "..", "templates");
  generateTemplateScaffold({ name, scaffoldType }, outputDir);
}
