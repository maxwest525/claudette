import { z } from "zod";

export const SourceIndexEntrySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  origin_type: z.enum([
    "web",
    "github",
    "pdf",
    "conversation",
    "manual",
    "api",
  ]),
  origin_url: z.string().optional(),
  raw_format: z.enum(["html", "markdown", "text", "pdf", "json"]),
  file_path: z.string(),
  size_bytes: z.number(),
  crawl_id: z.string().optional(),
  collected_at: z.string().datetime(),
  tags: z.array(z.string()),
  processed: z.boolean().default(false),
  processed_at: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const SourceIndexSchema = z.object({
  version: z.string().default("1.0.0"),
  last_updated: z.string().datetime(),
  total_sources: z.number(),
  sources: z.array(SourceIndexEntrySchema),
});

export const CrawlLogEntrySchema = z.object({
  crawl_id: z.string().uuid(),
  started_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  status: z.enum(["running", "completed", "failed", "partial"]),
  source_type: z.string(),
  target: z.string(),
  files_collected: z.number().default(0),
  errors: z.array(z.string()),
  notes: z.string().optional(),
});

export type SourceIndexEntry = z.infer<typeof SourceIndexEntrySchema>;
export type SourceIndex = z.infer<typeof SourceIndexSchema>;
export type CrawlLogEntry = z.infer<typeof CrawlLogEntrySchema>;
