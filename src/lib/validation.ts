import { z } from "zod";

const csv = z.string().optional().transform((v) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []));
const bool = z.enum(["true", "false"]).optional().transform((v) => (v === undefined ? undefined : v === "true"));

export const MODEL_TYPES = ["CHAT", "REASONING", "EMBEDDING", "IMAGE", "AUDIO", "CODE"] as const;
export const SORTS = ["name", "price_asc", "price_desc", "context_desc", "context_asc", "release_desc", "release_asc"] as const;

export const modelQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  lab: csv,
  provider: csv,
  type: csv.pipe(z.array(z.enum(MODEL_TYPES))),
  capability: csv,
  open: bool,
  minContext: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(SORTS).default("release_desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});
export type ModelQuery = z.infer<typeof modelQuerySchema>;

export const compareSchema = z.object({
  models: csv.pipe(z.array(z.string()).min(2, "Select at least 2 models").max(4, "Compare at most 4 models")),
});

export const rankingsSchema = z.object({
  benchmark: z.string().optional(),
  category: z.enum(["GENERAL", "REASONING", "CODING", "MATH", "MULTIMODAL"]).optional(),
  type: z.enum(MODEL_TYPES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export const searchSchema = z.object({ q: z.string().trim().min(1).max(100) });

export const paramsFrom = (req: Request) => Object.fromEntries(new URL(req.url).searchParams);
