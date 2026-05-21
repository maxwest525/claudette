import { BaseMetadataSchema, SkillMetadataSchema } from "../schemas/metadata.schema";
import { ValidationResult } from "./types";

export function validateBaseMetadata(data: unknown): ValidationResult {
  const result = BaseMetadataSchema.safeParse(data);
  if (result.success) {
    return { valid: true, errors: [], warnings: [] };
  }
  const errors = result.error.issues.map(
    (i) => `[${i.path.join(".")}] ${i.message}`
  );
  return { valid: false, errors, warnings: [] };
}

export function validateSkillMetadata(data: unknown): ValidationResult {
  const result = SkillMetadataSchema.safeParse(data);
  if (result.success) {
    return { valid: true, errors: [], warnings: [] };
  }
  const errors = result.error.issues.map(
    (i) => `[${i.path.join(".")}] ${i.message}`
  );
  return { valid: false, errors, warnings: [] };
}
