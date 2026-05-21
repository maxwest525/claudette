#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";

interface DuplicateResult {
  file_a: string;
  file_b: string;
  score: number;
  reason: string;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean)
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function collectSkillTexts(dir: string): { name: string; text: string }[] {
  if (!fs.existsSync(dir)) return [];
  const results: { name: string; text: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillMdPath = path.join(dir, entry.name, "SKILL.md");
    if (fs.existsSync(skillMdPath)) {
      results.push({ name: entry.name, text: fs.readFileSync(skillMdPath, "utf-8") });
    }
  }
  return results;
}

function detectDuplicates(threshold = 0.6): DuplicateResult[] {
  const skillsDir = path.join(__dirname, "..", "skills");
  const skills = collectSkillTexts(skillsDir);
  const duplicates: DuplicateResult[] = [];

  for (let i = 0; i < skills.length; i++) {
    for (let j = i + 1; j < skills.length; j++) {
      const tokensA = tokenize(skills[i].text);
      const tokensB = tokenize(skills[j].text);
      const score = jaccardSimilarity(tokensA, tokensB);
      if (score >= threshold) {
        duplicates.push({
          file_a: skills[i].name,
          file_b: skills[j].name,
          score: Math.round(score * 100) / 100,
          reason: `Jaccard similarity: ${Math.round(score * 100)}%`,
        });
      }
    }
  }

  return duplicates;
}

if (require.main === module) {
  const threshold = parseFloat(process.argv[2] || "0.6");
  const duplicates = detectDuplicates(threshold);

  if (duplicates.length === 0) {
    console.log("No duplicates found.");
  } else {
    console.log(`Found ${duplicates.length} potential duplicate(s):\n`);
    for (const d of duplicates) {
      console.log(`  ${d.file_a} <-> ${d.file_b}`);
      console.log(`  Score: ${d.score} | ${d.reason}\n`);
    }
    const reportPath = path.join(__dirname, "..", "duplicates", "report.json");
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(duplicates, null, 2));
    console.log(`Report saved to: ${reportPath}`);
  }
}
