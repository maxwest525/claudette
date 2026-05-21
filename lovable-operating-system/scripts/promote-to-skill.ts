#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import { generateSkillScaffold } from "../generators/skill-scaffold";

const ROOT = path.join(__dirname, "..");
const PROCESSED_INDEX_PATH = path.join(ROOT, "processed", "processed-index.json");

function main(): void {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: ts-node promote-to-skill.ts <processed-item-id> <skill-name>");
    console.error("  skill-name must be lowercase-hyphen format");
    process.exit(1);
  }

  const [itemId, skillName] = args;

  if (!fs.existsSync(PROCESSED_INDEX_PATH)) {
    console.error("No processed-index.json found.");
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(PROCESSED_INDEX_PATH, "utf-8"));
  const item = index.items.find((i: { id: string }) => i.id === itemId);

  if (!item) {
    console.error(`Item not found: ${itemId}`);
    process.exit(1);
  }

  const useWhen = `Use when you need to work with ${item.title.toLowerCase()}`;

  generateSkillScaffold(
    {
      name: skillName,
      description: useWhen,
      category: item.category || "general",
      tags: item.tags || [],
    },
    path.join(ROOT, "skills")
  );

  // Copy normalized content into SKILL.md
  if (fs.existsSync(item.normalized_path)) {
    const content = fs.readFileSync(item.normalized_path, "utf-8");
    const skillMdPath = path.join(ROOT, "skills", skillName, "SKILL.md");
    // Replace the template body with the actual content
    const existing = fs.readFileSync(skillMdPath, "utf-8");
    const header = existing.split("\n").slice(0, 3).join("\n");
    fs.writeFileSync(skillMdPath, header + "\n\n" + content);
  }

  // Mark as promoted
  item.status = "promoted";
  fs.writeFileSync(PROCESSED_INDEX_PATH, JSON.stringify(index, null, 2));

  console.log(`Promoted "${item.title}" to skill: ${skillName}`);
}

main();
