import { route, ok } from "@/lib/errors";
import { getLab } from "@/lib/services/directory";

export const GET = route<{ params: Promise<{ slug: string }> }>(async (_req, { params }) => ok(await getLab((await params).slug)));
