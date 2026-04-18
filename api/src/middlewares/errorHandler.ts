import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { isHttpError } from 'http-errors';

const errorHandler = (
  e: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (isHttpError(e)) {
    if (e.expose) {
      res.status(e.status).json({
        message: e.message,
        data: e.data,
      });
    }
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error',
    });
  }
  next();
};

export default errorHandler;
