#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";
import slugify from "slugify";
import { generateSkillScaffold } from "../generators/skill-scaffold";

const ROOT = path.join(__dirname, "..");
const CANDIDATES_PATH = path.join(ROOT, "processed", "skill-candidates.json");
const PROCESSED_INDEX_PATH = path.join(ROOT, "processed", "processed-index.json");
const SKILLS_DIR = path.join(ROOT, "skills");

interface Candidate {
  id: string;
  title: string;
  category: string;
  tags: string[];
  skill_candidate_score: number;
  quality_score: number;
  normalized_path: string;
  status: string;
}

function toSkillName(title: string): string {
  return slugify(title, { lower: true, strict: true }).slice(0, 50).replace(/-+$/, "");
}

function main(): void {
  const threshold = parseFloat(process.argv[2] || "0.5");

  if (!fs.existsSync(CANDIDATES_PATH)) {
    console.error("Error: 'skill-candidates.json' file is missing. Ensure you run `npm run candidates` first to generate the file.");
    process.exit(1);
  }

  const { candidates }: { candidates: Candidate[] } = JSON.parse(
    fs.readFileSync(CANDIDATES_PATH, "utf-8")
  );

  const eligible = candidates.filter(
    (c) => c.skill_candidate_score >= threshold && c.status !== "promoted"
  );

  if (eligible.length === 0) {
    console.log(`No candidates with score >= ${threshold}.`);
    return;
  }

  console.log(`Batch promoting ${eligible.length} candidate(s) (threshold: ${threshold})...\n`);

  const results: { title: string; skillName: string; score: number; category: string; status: string }[] = [];
  let processedIndex: { items: { id: string; status: string }[] } | null = null;

  if (fs.existsSync(PROCESSED_INDEX_PATH)) {
    processedIndex = JSON.parse(fs.readFileSync(PROCESSED_INDEX_PATH, "utf-8"));
  }

  for (const candidate of eligible) {
    const skillName = toSkillName(candidate.title);
    const skillDir = path.join(SKILLS_DIR, skillName);

    if (fs.existsSync(skillDir)) {
      results.push({ title: candidate.title, skillName, score: candidate.skill_candidate_score, category: candidate.category, status: "skipped (exists)" });
      continue;
    }

    try {
      const useWhen = `Use when you need to work with ${candidate.title.toLowerCase()}`;
      generateSkillScaffold(
        { name: skillName, description: useWhen, category: candidate.category || "general", tags: candidate.tags || [] },
        SKILLS_DIR
      );

      // Merge normalized content into SKILL.md if available
      if (candidate.normalized_path && fs.existsSync(candidate.normalized_path)) {
        const content = fs.readFileSync(candidate.normalized_path, "utf-8");
        const skillMdPath = path.join(skillDir, "SKILL.md");
        const existing = fs.readFileSync(skillMdPath, "utf-8");
        const headerLines = existing.split("\n").slice(0, 3).join("\n");
        fs.writeFileSync(skillMdPath, headerLines + "\n\n" + content);
      }

      // Mark as promoted in processed index
      if (processedIndex) {
        const item = processedIndex.items.find((i) => i.id === candidate.id);
        if (item) item.status = "promoted";
      }

      results.push({ title: candidate.title, skillName, score: candidate.skill_candidate_score, category: candidate.category, status: "promoted" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ title: candidate.title, skillName, score: candidate.skill_candidate_score, category: candidate.category, status: `error: ${msg}` });
    }
  }

  if (processedIndex) {
    fs.writeFileSync(PROCESSED_INDEX_PATH, JSON.stringify(processedIndex, null, 2));
  }

  console.log("Results:\n");
  console.log("Title".padEnd(40) + "Skill Name".padEnd(35) + "Score".padEnd(8) + "Status");
  console.log("-".repeat(100));
  for (const r of results) {
    console.log(r.title.slice(0, 39).padEnd(40) + r.skillName.slice(0, 34).padEnd(35) + String(r.score).padEnd(8) + r.status);
  }

  const promoted = results.filter((r) => r.status === "promoted").length;
  console.log(`\nDone. ${promoted} promoted, ${results.length - promoted} skipped/errored.`);
}

main();
