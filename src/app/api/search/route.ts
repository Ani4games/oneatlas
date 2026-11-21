import { route, ok } from "@/lib/errors";
import { globalSearch } from "@/lib/services/directory";
import { searchSchema, paramsFrom } from "@/lib/validation";

export const GET = route(async (req) => ok(await globalSearch(searchSchema.parse(paramsFrom(req)).q), undefined, "public, s-maxage=30"));
