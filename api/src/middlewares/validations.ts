import { Request as _Request, Response, NextFunction } from 'express';
import { ZodObject, ZodEffects, ZodError } from 'zod';
import { ValidationError } from '@/utils/errors';

type Request = _Request & {
  validated?: {
    body?: any;
    query?: any;
    params?: any;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateBody = <T extends ZodObject<any> | ZodEffects<any>>(schema: T) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.validated) {
      req.validated = {};
    }
    req.validated.body = validate(req.body, schema);
    next();
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateQuery = <T extends ZodObject<any> | ZodEffects<any>>(schema: T) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.validated) {
      req.validated = {};
    }
    req.validated.query = validate(req.query, schema);
    next();
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateParams = <T extends ZodObject<any> | ZodEffects<any>>(schema: T) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.validated) {
      req.validated = {};
    }
    req.validated.params = validate(req.params, schema);
    next();
  };
};

const validate = <T extends ZodObject<any> | ZodEffects<any>>(data: any, schema: T) => {
  try {
    return schema.parse(data) as z.infer<T>;
  } catch (e: unknown) {
    if (e instanceof ZodError) {
      const errorMessages = (e as ZodError).errors.map((error) => ({
        [`${error.path.join('.')}`]: error.message,
      }));
      throw new ValidationError(errorMessages);
    }
    throw e;
  }
};
