import { z } from "zod";

export const StatusEnum = z.enum([
  "draft",
  "review",
  "validated",
  "published",
  "archived",
  "duplicate",
]);

export const TypeEnum = z.enum([
  "skill",
  "workspace-knowledge",
  "project-knowledge",
  "design-system",
  "template",
  "raw-source",
]);

export const InstallMethodEnum = z.enum([
  "zip-import",
  "manual",
  "github-import",
  "api-push",
  "drag-drop",
]);

export const ValidationStatusEnum = z.enum([
  "pending",
  "passed",
  "failed",
  "skipped",
]);

export const BaseMetadataSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  type: TypeEnum,
  source: z.string(),
  tags: z.array(z.string()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  status: StatusEnum,
  install_method: InstallMethodEnum.optional(),
  duplicate_score: z.number().min(0).max(1).optional(),
  validation_status: ValidationStatusEnum,
  version: z.string().optional(),
  author: z.string().optional(),
  description: z.string().optional(),
});

export const SkillMetadataSchema = BaseMetadataSchema.extend({
  type: z.literal("skill"),
  skill_name: z
    .string()
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Skill name must be lowercase-hyphen format"
    ),
  use_when: z.string().min(10),
  bundled_files: z.array(z.string()).optional(),
  install_method: InstallMethodEnum.default("zip-import"),
  category: z.string().optional(),
  lovable_compatible: z.boolean().default(true),
});

export const WorkspaceKnowledgeMetadataSchema = BaseMetadataSchema.extend({
  type: z.literal("workspace-knowledge"),
  workspace_id: z.string().optional(),
  size_bytes: z.number().optional(),
  max_size_bytes: z.number().default(50000),
  category: z.string().optional(),
});

export const ProjectKnowledgeMetadataSchema = BaseMetadataSchema.extend({
  type: z.literal("project-knowledge"),
  project_id: z.string().optional(),
  size_bytes: z.number().optional(),
  max_size_bytes: z.number().default(50000),
  category: z.string().optional(),
});

export const DesignSystemMetadataSchema = BaseMetadataSchema.extend({
  type: z.literal("design-system"),
  has_system_md: z.boolean().default(false),
  has_rules_dir: z.boolean().default(false),
  components_count: z.number().default(0),
  tokens_count: z.number().default(0),
  framework: z.string().optional(),
});

export const TemplateMetadataSchema = BaseMetadataSchema.extend({
  type: z.literal("template"),
  scaffold_type: z.string(),
  files_included: z.array(z.string()),
  starter_structure: z.string().optional(),
});

export const RawSourceMetadataSchema = BaseMetadataSchema.extend({
  type: z.literal("raw-source"),
  origin_url: z.string().url().optional(),
  origin_type: z.enum([
    "web",
    "github",
    "pdf",
    "conversation",
    "manual",
    "api",
  ]),
  raw_format: z.enum(["html", "markdown", "text", "pdf", "json"]),
  file_path: z.string(),
  crawl_id: z.string().optional(),
  processed: z.boolean().default(false),
  processed_at: z.string().datetime().optional(),
});

export type BaseMetadata = z.infer<typeof BaseMetadataSchema>;
export type SkillMetadata = z.infer<typeof SkillMetadataSchema>;
export type WorkspaceKnowledgeMetadata = z.infer<
  typeof WorkspaceKnowledgeMetadataSchema
>;
export type ProjectKnowledgeMetadata = z.infer<
  typeof ProjectKnowledgeMetadataSchema
>;
export type DesignSystemMetadata = z.infer<typeof DesignSystemMetadataSchema>;
export type TemplateMetadata = z.infer<typeof TemplateMetadataSchema>;
export type RawSourceMetadata = z.infer<typeof RawSourceMetadataSchema>;
