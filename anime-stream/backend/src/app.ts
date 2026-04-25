import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import animeRoutes from './routes/anime.routes';
import authRoutes from './routes/auth.routes';
import commentsRoutes from './routes/comments.routes';

const app = express();

// Безопасность
app.use(helmet());

// CORS
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));

// Парсинг JSON и cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: 'Слишком много запросов, попробуйте позже',
});

app.use('/api/', limiter);

// Более строгий rate limit для auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10, // макс 10 запросов
  message: 'Слишком много попыток авторизации',
});

app.use('/api/auth', authLimiter);

// Маршруты
app.use('/api/anime', animeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentsRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Обработка 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Глобальная обработка ошибок
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Необработанная ошибка:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Внутренняя ошибка сервера',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

export default app;
