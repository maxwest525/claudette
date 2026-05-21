#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import { validateSkillFolder } from "../validators/skill-validator";
import { validateDesignSystemFolder } from "../validators/design-system-validator";

const ROOT = path.join(__dirname, "..");

interface AuditReport {
  skills: { folder: string; valid: boolean; errors: string[]; warnings: string[] }[];
  designSystems: { folder: string; valid: boolean; errors: string[]; warnings: string[] }[];
  summary: { total: number; passed: number; failed: number };
}

function validateAllSkills(): AuditReport["skills"] {
  const skillsDir = path.join(ROOT, "skills");
  if (!fs.existsSync(skillsDir)) return [];

  const results: AuditReport["skills"] = [];
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const folderPath = path.join(skillsDir, entry.name);
    const result = validateSkillFolder(folderPath);
    results.push({ folder: entry.name, ...result });
  }
  return results;
}

function validateAllDesignSystems(): AuditReport["designSystems"] {
  const dsDir = path.join(ROOT, "design-systems");
  if (!fs.existsSync(dsDir)) return [];

  const results: AuditReport["designSystems"] = [];
  const entries = fs.readdirSync(dsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const folderPath = path.join(dsDir, entry.name);
    const result = validateDesignSystemFolder(folderPath);
    results.push({ folder: entry.name, ...result });
  }
  return results;
}

function main() {
  console.log("=== Lovable OS Validation Report ===\n");

  const skillResults = validateAllSkills();
  const dsResults = validateAllDesignSystems();

  console.log(`-- Skills (${skillResults.length}) --`);
  for (const r of skillResults) {
    const icon = r.valid ? "✓" : "✗";
    console.log(`${icon} ${r.folder}`);
    for (const e of r.errors) console.log(`    ERROR: ${e}`);
    for (const w of r.warnings) console.log(`    WARN:  ${w}`);
  }

  console.log(`\n-- Design Systems (${dsResults.length}) --`);
  for (const r of dsResults) {
    const icon = r.valid ? "✓" : "✗";
    console.log(`${icon} ${r.folder}`);
    for (const e of r.errors) console.log(`    ERROR: ${e}`);
    for (const w of r.warnings) console.log(`    WARN:  ${w}`);
  }

  const all = [...skillResults, ...dsResults];
  const passed = all.filter((r) => r.valid).length;
  const failed = all.length - passed;

  console.log(`\n=== Summary ===`);
  console.log(`Total: ${all.length} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) process.exit(1);
}

main();
