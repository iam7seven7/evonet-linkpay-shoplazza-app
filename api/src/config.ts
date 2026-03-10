import dotenv from 'dotenv';

interface Config {
  port: number;
  nodeEnv: string;
  authSecret: string;
  app: {
    name: string;
    host: string;
  };
}

dotenv.config();

const getOsEnv = (key: string) => {
  if (typeof process.env[key] === 'undefined') {
    throw new Error(`Environment variable ${key} is not set.`);
  }
  return process.env[key] as string;
};

const config: Config = {
  port: Number(getOsEnv('PORT')),
  nodeEnv: getOsEnv('NODE_ENV'),
  authSecret: getOsEnv('AUTH_SECRET'),
  app: {
    name: getOsEnv('APP_NAME'),
    host: getOsEnv('APP_HOST'),
  },
};

export default config;
