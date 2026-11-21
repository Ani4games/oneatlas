import { route, ok } from "@/lib/errors";
import { listModels } from "@/lib/services/models";
import { modelQuerySchema, paramsFrom } from "@/lib/validation";

export const GET = route(async (req) => {
  const q = modelQuerySchema.parse(paramsFrom(req));
  const { items, meta } = await listModels(q);
  return ok(items, meta);
});
