import { route, ok } from "@/lib/errors";
import { getModel } from "@/lib/services/models";

export const GET = route<{ params: Promise<{ slug: string }> }>(async (_req, { params }) => ok(await getModel((await params).slug)));
