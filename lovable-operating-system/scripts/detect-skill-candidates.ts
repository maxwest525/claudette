#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";

const ROOT = path.join(__dirname, "..");
const PROCESSED_INDEX_PATH = path.join(ROOT, "processed", "processed-index.json");
const CANDIDATES_PATH = path.join(ROOT, "processed", "skill-candidates.json");

const THRESHOLD = 0.4;

interface ProcessedItem {
  id: string;
  title: string;
  type: string;
  category: string;
  tags: string[];
  word_count: number;
  skill_candidate_score: number;
  quality_score: number;
  normalized_path: string;
  status: string;
}

function main(): void {
  if (!fs.existsSync(PROCESSED_INDEX_PATH)) {
    console.log("No processed-index.json found — writing empty candidates file.");
    fs.mkdirSync(path.join(ROOT, "processed"), { recursive: true });
    fs.writeFileSync(CANDIDATES_PATH, JSON.stringify({ generated_at: new Date().toISOString(), threshold: THRESHOLD, total: 0, candidates: [] }, null, 2));
    return;
  }

  const index = JSON.parse(fs.readFileSync(PROCESSED_INDEX_PATH, "utf-8"));
  const items: ProcessedItem[] = index.items || [];

  const candidates = items
    .filter(
      (item) =>
        item.skill_candidate_score >= THRESHOLD &&
        item.status !== "duplicate" &&
        item.status !== "archived"
    )
    .sort((a, b) => b.skill_candidate_score - a.skill_candidate_score);

  fs.writeFileSync(
    CANDIDATES_PATH,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        threshold: THRESHOLD,
        total: candidates.length,
        candidates,
      },
      null,
      2
    )
  );

  console.log(`Skill Candidates (score >= ${THRESHOLD}):\n`);
  if (candidates.length === 0) {
    console.log("  None found.");
  } else {
    for (const c of candidates) {
      console.log(`  [${c.skill_candidate_score.toFixed(2)}] ${c.title}`);
      console.log(`        category: ${c.category} | words: ${c.word_count} | tags: ${c.tags.slice(0, 3).join(", ")}`);
    }
    console.log(`\nSaved: ${CANDIDATES_PATH}`);
  }
}

main();
