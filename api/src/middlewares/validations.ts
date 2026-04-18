import { ValidatedRequest } from '@/types';
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import * as z from 'zod';
import { logger } from '@/middlewares/logger';

/* eslint-disable @typescript-eslint/no-explicit-any */ 
export const validateBody = <
  T extends z.ZodDiscriminatedUnion<any> | z.ZodObject<any>,
>(
  schema: T,
) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    const req = _req as ValidatedRequest;
    if (!req.validated) {
      req.validated = {};
    }
    const value = validate(req.body, schema);
    logger.debug(`Validated body: ${JSON.stringify(value)}`);
    req.validated.body = value;
    next();
  };
};

export const validateQuery = <
  T extends z.ZodDiscriminatedUnion<any> | z.ZodObject<any>,
>(
  schema: T,
) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    const req = _req as ValidatedRequest;
    if (!req.validated) {
      req.validated = {};
    }
    const value = validate(req.query, schema);
    logger.debug(`Validated query: ${JSON.stringify(value)}`);
    req.validated.query = value;
    next();
  };
};

export const validateParams = <
  T extends z.ZodDiscriminatedUnion<any> | z.ZodObject<any>,
>(
  schema: T,
) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    const req = _req as ValidatedRequest;
    if (!req.validated) {
      req.validated = {};
    }
    const value = validate(req.params, schema);
    logger.debug(`Validated params: ${JSON.stringify(value)}`);
    req.validated.params = value;
    next();
  };
};

const validate = <T extends z.ZodDiscriminatedUnion<any> | z.ZodObject<any>>(
  data: any,
  schema: T,
) => {
  try {
    return schema.parse(data) as z.infer<T>;
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      const httpError = createHttpError(422);
      httpError.code = 'VALIDATION_ERROR';
      httpError.data = z.treeifyError(e as z.ZodError);
      throw httpError;
    }
    throw e;
  }
};
/* eslint-enable @typescript-eslint/no-explicit-any */ 
