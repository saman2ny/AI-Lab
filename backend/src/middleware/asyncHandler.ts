import type { NextFunction, Request, RequestHandler, Response } from "express";

// Express 4 doesn't forward a rejected promise from an async route handler
// to the error middleware on its own — an uncaught rejection in one would
// otherwise just hang the request. Wrap every async handler with this so
// unexpected failures reach errorHandler instead.
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
