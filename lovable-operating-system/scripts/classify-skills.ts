#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "ui-components": ["button", "modal", "form", "input", "card", "table", "nav", "sidebar", "layout"],
  "authentication": ["auth", "login", "logout", "password", "session", "jwt", "oauth", "signup"],
  "api-integration": ["api", "fetch", "rest", "graphql", "webhook", "endpoint", "request", "response"],
  "database": ["database", "db", "sql", "query", "schema", "migration", "model", "orm"],
  "state-management": ["state", "store", "redux", "zustand", "context", "signal", "reactive"],
  "styling": ["css", "tailwind", "style", "theme", "color", "font", "responsive", "design"],
  "testing": ["test", "spec", "mock", "jest", "vitest", "playwright", "cypress", "assertion"],
  "deployment": ["deploy", "ci", "cd", "docker", "build", "pipeline", "release", "hosting"],
  "ai-integration": ["ai", "llm", "claude", "openai", "prompt", "embedding", "vector", "chat"],
  "file-handling": ["file", "upload", "download", "storage", "image", "pdf", "csv", "import", "export"],
};

export function classifySkill(text: string): string {
  const lower = text.toLowerCase();
  let bestCategory = "general";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

function classifyAllSkills(): void {
  const skillsDir = path.join(__dirname, "..", "skills");
  if (!fs.existsSync(skillsDir)) {
    console.log("No skills directory found.");
    return;
  }

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const skillMdPath = path.join(skillsDir, entry.name, "SKILL.md");
    const metadataPath = path.join(skillsDir, entry.name, "metadata.json");

    if (!fs.existsSync(skillMdPath)) continue;

    const text = fs.readFileSync(skillMdPath, "utf-8");
    const category = classifySkill(text);

    console.log(`${entry.name}: ${category}`);

    if (fs.existsSync(metadataPath)) {
      const meta = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
      if (!meta.category || meta.category === "general") {
        meta.category = category;
        meta.updated_at = new Date().toISOString();
        fs.writeFileSync(metadataPath, JSON.stringify(meta, null, 2));
      }
    }
  }
}

if (require.main === module) {
  classifyAllSkills();
}
