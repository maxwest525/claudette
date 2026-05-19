import * as fs from "fs";
import * as path from "path";
import { ValidationResult } from "./types";

export function validateDesignSystemFolder(folderPath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fs.existsSync(folderPath)) {
    errors.push(`Design system folder not found: ${folderPath}`);
    return { valid: false, errors, warnings };
  }

  const lovablePath = path.join(folderPath, ".lovable");
  const systemMdPath = path.join(lovablePath, "system.md");
  const rulesPath = path.join(lovablePath, "rules");

  if (!fs.existsSync(lovablePath)) {
    errors.push("Missing .lovable/ directory");
  }

  if (!fs.existsSync(systemMdPath)) {
    errors.push("Missing .lovable/system.md");
  } else {
    const content = fs.readFileSync(systemMdPath, "utf-8");
    if (content.length < 50) {
      warnings.push(".lovable/system.md appears to be nearly empty");
    }
    if (!content.includes("# ")) {
      warnings.push(".lovable/system.md has no H1 heading");
    }
  }

  if (!fs.existsSync(rulesPath)) {
    warnings.push("Missing .lovable/rules/ directory");
  } else {
    const rules = fs.readdirSync(rulesPath).filter((f) => f.endsWith(".md"));
    if (rules.length === 0) {
      warnings.push(".lovable/rules/ directory is empty");
    }
  }

  const expectedDocs = ["components.md", "styling.md", "tokens.md", "patterns.md"];
  for (const doc of expectedDocs) {
    const docPath = path.join(folderPath, doc);
    if (!fs.existsSync(docPath)) {
      warnings.push(`Recommended doc missing: ${doc}`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
