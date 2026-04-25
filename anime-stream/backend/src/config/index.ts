import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // База данных
  databaseUrl: process.env.DATABASE_URL || '',
  
  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_change_me',
  jwtExpiresIn: '15m',
  jwtRefreshExpiresIn: '7d',
  
  // Внешнее API
  externalApiUrl: process.env.EXTERNAL_API_URL || '',
  externalApiKey: process.env.EXTERNAL_API_KEY || '',
  
  // Rate limiting
  rateLimitWindowMs: 15 * 60 * 1000, // 15 минут
  rateLimitMax: 100, // макс запросов
  
  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
};
