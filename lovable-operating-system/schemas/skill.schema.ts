import { z } from "zod";

export const SkillFileSchema = z.object({
  name: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  description: z.string().startsWith("Use when"),
  body: z.string().min(50),
  bundled_files: z.array(z.string()).optional(),
  metadata_path: z.string().optional(),
});

export const SkillPackageSchema = z.object({
  skill_md_path: z.string(),
  metadata_json_path: z.string(),
  zip_path: z.string().optional(),
  valid: z.boolean(),
  errors: z.array(z.string()),
});

export type SkillFile = z.infer<typeof SkillFileSchema>;
export type SkillPackage = z.infer<typeof SkillPackageSchema>;
