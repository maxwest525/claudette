import { z } from "zod";

export const ProcessedItemSchema = z.object({
  id: z.string().uuid(),
  source_id: z.string().uuid(),
  title: z.string(),
  type: z.enum(["skill-candidate", "knowledge-candidate", "reference", "noise"]),
  category: z.string(),
  tags: z.array(z.string()),
  word_count: z.number(),
  char_count: z.number(),
  has_code_blocks: z.boolean(),
  heading_count: z.number(),
  content_hash: z.string(),
  skill_candidate_score: z.number().min(0).max(1),
  quality_score: z.number().min(0).max(1),
  normalized_path: z.string(),
  original_path: z.string(),
  processed_at: z.string().datetime(),
  enriched_at: z.string().datetime().optional(),
  status: z.enum(["processed", "enriched", "promoted", "archived", "duplicate"]),
  duplicate_of: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export const ProcessedIndexSchema = z.object({
  version: z.string().default("1.0.0"),
  last_updated: z.string().datetime(),
  total_items: z.number(),
  items: z.array(ProcessedItemSchema),
});

export type ProcessedItem = z.infer<typeof ProcessedItemSchema>;
export type ProcessedIndex = z.infer<typeof ProcessedIndexSchema>;
