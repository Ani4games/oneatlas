import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class NotFoundError extends Error {
  constructor(what: string) { super(`${what} not found`); }
}
export class BadRequestError extends Error {}

type Handler<C> = (req: Request, ctx: C) => Promise<NextResponse | Response>;

/** Wraps a route handler with uniform error handling: {error:{code,message,details?}} */
export function route<C = unknown>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof ZodError) {
        return NextResponse.json(
          { error: { code: "VALIDATION_ERROR", message: "Invalid request parameters", details: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })) } },
          { status: 400 },
        );
      }
      if (e instanceof BadRequestError) return NextResponse.json({ error: { code: "BAD_REQUEST", message: e.message } }, { status: 400 });
      if (e instanceof NotFoundError) return NextResponse.json({ error: { code: "NOT_FOUND", message: e.message } }, { status: 404 });
      console.error("[api]", e);
      return NextResponse.json({ error: { code: "INTERNAL", message: "Something went wrong" } }, { status: 500 });
    }
  };
}

export const ok = (data: unknown, meta?: unknown, cache = "public, s-maxage=60, stale-while-revalidate=300") =>
  NextResponse.json(meta ? { data, meta } : { data }, { headers: { "Cache-Control": cache } });
