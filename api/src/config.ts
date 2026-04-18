import dotenv from 'dotenv';

interface Config {
  port: number;
  nodeEnv: string;
  db: string;
  redis: string;
  app: {
    name: string;
    host: string;
    baseUrl: string;
  };
  shoplazza: {
    appId: string;
    clientId: string;
    clientSecret: string;
    testMode: boolean;
  };
  linkpay: {
    baseUrl: string;
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
  db: getOsEnv('DATABASE_URL'),
  redis: getOsEnv('REDIS_URL'),
  app: {
    name: getOsEnv('APP_NAME'),
    host: getOsEnv('APP_HOST'),
    baseUrl: `https://${getOsEnv('APP_HOST')}`,
  },
  shoplazza: {
    appId: getOsEnv('SHOPLAZZA_APP_ID'),
    clientId: getOsEnv('SHOPLAZZA_CLIENT_ID'),
    clientSecret: getOsEnv('SHOPLAZZA_CLIENT_SECRET'),
    testMode: getOsEnv('NODE_ENV') !== 'production',
  },
  linkpay: {
    baseUrl: getOsEnv('LINKPAY_BASE_URL'),
  },
};

export default config;
