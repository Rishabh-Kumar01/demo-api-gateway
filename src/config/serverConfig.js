import dotenv from 'dotenv';

dotenv.config();

export const serverConfig = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
  USER_SERVICE_URL: process.env.USER_SERVICE_URL,
  AUTH_SERVICE_PATH: process.env.AUTH_SERVICE_PATH,
  USER_SERVICE_PATH: process.env.USER_SERVICE_PATH,
};
