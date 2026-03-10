import winston from 'winston';
import expressWinston from 'express-winston';

export const requestLogger = expressWinston.logger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
});

export const errorLogger = expressWinston.errorLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
});

export const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  // format: winston.format.combine(
  //   winston.format.timestamp(),
  //   winston.format.errors({ stack: true }),
  //   winston.format.json()
  // ),
  format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
});
// const devFormat = winston.format.combine(
//   winston.format.colorize(),
//   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//   winston.format.printf(({ timestamp, level, message, ...metadata }) => {
//     let msg = `${timestamp} [${level}]: ${message}`;
//     if (Object.keys(metadata).length) {
//       msg += ` ${JSON.stringify(metadata)}`;
//     }
//     return msg;
//   })
// );
