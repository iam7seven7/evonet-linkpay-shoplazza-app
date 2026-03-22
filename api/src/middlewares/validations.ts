import { Request } from '@/types';
import { Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
// import { z, z.ZodObject, z.ZodError } from 'zod';
import * as z from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateBody = <T extends z.ZodObject<any>>(schema: T) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.validated) {
      req.validated = {};
    }
    req.validated.body = validate(req.body, schema);
    next();
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateQuery = <T extends z.ZodObject<any>>(schema: T) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.validated) {
      req.validated = {};
    }
    req.validated.query = validate(req.query, schema);
    next();
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateParams = <T extends z.ZodObject<any>>(schema: T) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.validated) {
      req.validated = {};
    }
    req.validated.params = validate(req.params, schema);
    next();
  };
};

const validate = <T extends z.ZodObject<any>>(data: any, schema: T) => {
  try {
    return schema.parse(data) as z.infer<T>;
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      const httpError = createHttpError(422);
      httpError.data = z.treeifyError(e as z.ZodError);
      throw httpError;
    }
    throw e;
  }
};
