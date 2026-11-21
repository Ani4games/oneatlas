import { route, ok } from "@/lib/errors";
import { getRankings } from "@/lib/services/rankings";
import { rankingsSchema, paramsFrom } from "@/lib/validation";

export const GET = route(async (req) => ok(await getRankings(rankingsSchema.parse(paramsFrom(req)))));
