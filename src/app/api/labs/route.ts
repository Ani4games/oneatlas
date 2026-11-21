import { route, ok } from "@/lib/errors";
import { listLabs } from "@/lib/services/directory";

export const GET = route(async () => ok(await listLabs()));
