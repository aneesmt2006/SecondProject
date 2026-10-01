import type { NextFunction, Request, Response } from "express";

export const idHandler = (
  req: Request,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  const id = req.headers["x-token-id"] as string;
  return id;
};
