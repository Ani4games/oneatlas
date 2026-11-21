import { route, ok } from "@/lib/errors";
import { listProviders } from "@/lib/services/directory";

export const GET = route(async () => ok(await listProviders()));
