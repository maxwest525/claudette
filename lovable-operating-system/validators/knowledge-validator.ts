import * as fs from "fs";

const MAX_KNOWLEDGE_BYTES = 50_000;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateKnowledgeSize(filePath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fs.existsSync(filePath)) {
    errors.push(`File not found: ${filePath}`);
    return { valid: false, errors, warnings };
  }

  const stats = fs.statSync(filePath);
  if (stats.size > MAX_KNOWLEDGE_BYTES) {
    errors.push(
      `File exceeds 50KB limit: ${stats.size} bytes (limit: ${MAX_KNOWLEDGE_BYTES})`
    );
  } else if (stats.size > MAX_KNOWLEDGE_BYTES * 0.8) {
    warnings.push(
      `File is approaching 50KB limit: ${stats.size} bytes`
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateKnowledgeMarkdown(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!content || content.trim().length === 0) {
    errors.push("Knowledge content is empty");
    return { valid: false, errors, warnings };
  }

  if (!content.includes("# ")) {
    warnings.push("Knowledge file has no H1 heading");
  }

  const codeBlockCount = (content.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    errors.push("Malformed markdown: unclosed code block detected");
  }

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    if (match[2].startsWith("javascript:")) {
      errors.push(`Unsafe link detected: ${match[0]}`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateCategoryTag(tags: string[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!tags || tags.length === 0) {
    warnings.push("No category tags provided");
    return { valid: true, errors, warnings };
  }

  const validPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  for (const tag of tags) {
    if (!validPattern.test(tag)) {
      errors.push(
        `Tag "${tag}" is not valid — use lowercase-hyphen format`
      );
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
