import winston from 'winston';
import expressWinston from 'express-winston';
import config from '@/config';

export const requestLogger = expressWinston.logger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
  requestWhitelist: [
    'method',
    'url',
    'query',
    'headers',
    ...((config.nodeEnv !== 'production' && ['body']) || []),
  ],
  responseWhitelist: [
    'statusCode',
    'query',
    'headers',
    ...((config.nodeEnv !== 'production' && ['body']) || []),
  ],
});

export const errorLogger = expressWinston.errorLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
});

export const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
});
