import * as fs from "fs";
import * as path from "path";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateSkillName(name: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!name) {
    errors.push("Skill name is required");
    return { valid: false, errors, warnings };
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    errors.push(
      `Skill name "${name}" must be lowercase-hyphen format (e.g., "my-skill-name")`
    );
  }
  if (name.length > 60) {
    warnings.push("Skill name is longer than 60 characters; consider shortening");
  }
  if (name.length < 3) {
    errors.push("Skill name must be at least 3 characters");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateSkillDescription(description: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!description) {
    errors.push("Skill description is required");
    return { valid: false, errors, warnings };
  }
  if (!description.startsWith("Use when")) {
    errors.push(`Description must start with "Use when" — got: "${description.slice(0, 40)}..."`);
  }
  if (description.length < 20) {
    errors.push("Description is too short (minimum 20 characters)");
  }
  if (description.length > 500) {
    warnings.push("Description is very long; consider trimming below 500 characters");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateSkillMd(filePath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fs.existsSync(filePath)) {
    errors.push(`SKILL.md not found at: ${filePath}`);
    return { valid: false, errors, warnings };
  }

  const content = fs.readFileSync(filePath, "utf-8");

  if (!content.includes("# ")) {
    errors.push("SKILL.md missing H1 title");
  }
  if (!content.toLowerCase().includes("use when")) {
    errors.push('SKILL.md missing "Use when" section');
  }
  if (content.length < 100) {
    errors.push("SKILL.md body is too short (minimum 100 characters)");
  }
  if (!content.includes("```")) {
    warnings.push("SKILL.md has no code blocks — consider adding examples");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateSkillFolder(folderPath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fs.existsSync(folderPath)) {
    errors.push(`Skill folder not found: ${folderPath}`);
    return { valid: false, errors, warnings };
  }

  const skillMdPath = path.join(folderPath, "SKILL.md");
  const metadataPath = path.join(folderPath, "metadata.json");

  if (!fs.existsSync(skillMdPath)) {
    errors.push("Missing SKILL.md in skill folder");
  } else {
    const mdResult = validateSkillMd(skillMdPath);
    errors.push(...mdResult.errors);
    warnings.push(...mdResult.warnings);
  }

  if (!fs.existsSync(metadataPath)) {
    warnings.push("Missing metadata.json in skill folder");
  } else {
    try {
      const meta = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
      if (!meta.title) errors.push("metadata.json missing 'title'");
      if (!meta.type) errors.push("metadata.json missing 'type'");
      if (!meta.skill_name) errors.push("metadata.json missing 'skill_name'");
      if (!meta.use_when) errors.push("metadata.json missing 'use_when'");
    } catch {
      errors.push("metadata.json is malformed JSON");
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
