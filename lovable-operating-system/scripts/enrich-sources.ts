#!/usr/bin/env ts-node
import * as fs from "fs";
import * as path from "path";

const ROOT = path.join(__dirname, "..");
const PROCESSED_INDEX_PATH = path.join(ROOT, "processed", "processed-index.json");

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "ui-components": ["button", "modal", "form", "input", "card", "table", "nav", "sidebar", "layout", "component"],
  "authentication": ["auth", "login", "logout", "password", "session", "jwt", "oauth", "signup", "token"],
  "api-integration": ["api", "fetch", "rest", "graphql", "webhook", "endpoint", "request", "response", "http"],
  "database": ["database", "db", "sql", "query", "schema", "migration", "model", "orm", "supabase", "postgres"],
  "state-management": ["state", "store", "redux", "zustand", "context", "signal", "reactive", "global"],
  "styling": ["css", "tailwind", "style", "theme", "color", "font", "responsive", "design", "className"],
  "testing": ["test", "spec", "mock", "jest", "vitest", "playwright", "cypress", "assertion", "unit", "e2e"],
  "deployment": ["deploy", "ci", "cd", "docker", "build", "pipeline", "release", "hosting", "vercel", "netlify"],
  "ai-integration": ["ai", "llm", "claude", "openai", "prompt", "embedding", "vector", "chat", "anthropic"],
  "file-handling": ["file", "upload", "download", "storage", "image", "pdf", "csv", "import", "export", "blob"],
  "routing": ["route", "router", "navigation", "redirect", "link", "path", "url", "page", "history"],
  "error-handling": ["error", "try", "catch", "exception", "boundary", "fallback", "retry", "handle"],
};

function classifyContent(text: string): { category: string; matchedTags: string[] } {
  const lower = text.toLowerCase();
  let bestCategory = "general";
  let bestScore = 0;
  const matchedTags: string[] = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter((kw) => lower.includes(kw));
    if (matches.length > bestScore) {
      bestScore = matches.length;
      bestCategory = category;
    }
    if (matches.length > 0) {
      matchedTags.push(...matches.slice(0, 2));
    }
  }

  return { category: bestCategory, matchedTags: [...new Set(matchedTags)].slice(0, 6) };
}

function main(): void {
  if (!fs.existsSync(PROCESSED_INDEX_PATH)) {
    console.log("No processed-index.json found. Run `npm run process` first.");
    return;
  }

  const index = JSON.parse(fs.readFileSync(PROCESSED_INDEX_PATH, "utf-8"));
  let count = 0;

  for (const item of index.items) {
    if (item.status === "enriched" || item.status === "promoted" || item.status === "archived") continue;

    if (!fs.existsSync(item.normalized_path)) continue;
    const content = fs.readFileSync(item.normalized_path, "utf-8");

    const { category, matchedTags } = classifyContent(content);
    item.category = category;
    item.tags = [...new Set([...item.tags, ...matchedTags])];
    item.status = "enriched";
    item.enriched_at = new Date().toISOString();

    // Update sidecar meta
    const metaPath = item.normalized_path + ".meta.json";
    fs.writeFileSync(metaPath, JSON.stringify(item, null, 2));
    count++;
  }

  index.last_updated = new Date().toISOString();
  fs.writeFileSync(PROCESSED_INDEX_PATH, JSON.stringify(index, null, 2));

  console.log(`Enriched ${count} item(s).`);
}

main();
