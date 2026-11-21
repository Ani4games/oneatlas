import { route, ok } from "@/lib/errors";
import { getFilters } from "@/lib/services/models";

export const GET = route(async () => ok(await getFilters(), undefined, "public, s-maxage=300"));
