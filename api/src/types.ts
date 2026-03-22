import { Request as _Request } from 'express';

export type Request = _Request & {
  validated?: {
    body?: any;
    query?: any;
    params?: any;
  };
};
