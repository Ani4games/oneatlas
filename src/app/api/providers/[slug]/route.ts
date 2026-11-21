import { route, ok } from "@/lib/errors";
import { getProvider } from "@/lib/services/directory";

export const GET = route<{ params: Promise<{ slug: string }> }>(async (_req, { params }) => ok(await getProvider((await params).slug)));
