import { route, ok } from "@/lib/errors";
import { compareModels } from "@/lib/services/models";
import { compareSchema, paramsFrom } from "@/lib/validation";

export const GET = route(async (req) => ok(await compareModels(compareSchema.parse(paramsFrom(req)).models)));
