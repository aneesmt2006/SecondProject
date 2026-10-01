import type { NextFunction, Request, Response } from "express";
import type { ZodObject, ZodRawShape } from "zod";
import { HTTP_STATUS } from "../constants/http-status.constant.js";

export const validate = (schema: ZodObject<ZodRawShape>) => {
  // eslint-disable-next-line @typescript-eslint/require-await
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: result.error });
    }

    req.body = result.data;
    next();
  };
};
