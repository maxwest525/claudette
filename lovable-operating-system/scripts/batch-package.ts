#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import { packageSkill } from "./package-skill";
import { validateSkillFolder } from "../validators/skill-validator";

const ROOT = path.join(__dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const EXPORTS_DIR = path.join(ROOT, "exports");

async function main(): Promise<void> {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.log("No skills directory found.");
    return;
  }

  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true }).filter((e) => e.isDirectory());

  if (entries.length === 0) {
    console.log("No skills found in skills/");
    return;
  }

  console.log(`Packaging ${entries.length} skill(s)...\n`);

  const results: { name: string; status: string; path?: string }[] = [];

  for (const entry of entries) {
    const folderPath = path.join(SKILLS_DIR, entry.name);
    const validation = validateSkillFolder(folderPath);

    if (!validation.valid) {
      results.push({ name: entry.name, status: `skipped: ${validation.errors[0]}` });
      continue;
    }

    try {
      const zipPath = await packageSkill(folderPath, EXPORTS_DIR);
      results.push({ name: entry.name, status: "packaged", path: zipPath });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ name: entry.name, status: `error: ${msg}` });
    }
  }

  console.log("\nResults:");
  for (const r of results) {
    const icon = r.status === "packaged" ? "✓" : "✗";
    console.log(`  ${icon} ${r.name} — ${r.status}`);
  }

  const packaged = results.filter((r) => r.status === "packaged").length;
  console.log(`\nDone. ${packaged}/${entries.length} packaged to ${EXPORTS_DIR}`);
}

main().catch(console.error);
