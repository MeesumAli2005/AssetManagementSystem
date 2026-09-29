// A validation layer in front of the write endpoints. This catches
// malformed requests (wrong types, missing required fields) with a clean,
// uniform 400 before a handler ever touches the database — TypeScript can't
// do this job, since it has no visibility into what actually arrives over
// the network. This is deliberately a first-layer type/presence check, not
// a reimplementation of every business rule already in the controllers
// (e.g. "category_id is required only for an asset-type request" stays
// where it is, since it depends on another field's value, not just its own
// shape).
import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
}

// URL params are always strings (or string[] for a repeated param) — this
// just confirms it looks like a positive integer before any handler tries
// to use it in a query, instead of a bad id surfacing as a confusing
// downstream error.
export function validateIdParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const raw = req.params[paramName];
    if (!raw || Array.isArray(raw) || !/^\d+$/.test(raw)) {
      return res
        .status(400)
        .json({ message: `${paramName} must be a positive integer` });
    }
    next();
  };
}
