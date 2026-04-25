import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../models/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'USER' | 'MODERATOR' | 'ADMIN';
  };
}

/**
 * Middleware для проверки JWT токена
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; role: string };
    
    // Проверка пользователя в БД (не забанен ли)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isBanned: true },
    });

    if (!user || user.isBanned) {
      return res.status(401).json({ error: 'Пользователь не найден или заблокирован' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Токен истек' });
    }
    return res.status(401).json({ error: 'Неверный токен' });
  }
};

/**
 * Middleware для проверки роли пользователя
 */
export const authorize = (...roles: ('USER' | 'MODERATOR' | 'ADMIN')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }

    next();
  };
};

/**
 * Опциональная аутентификация (не требует обязательного токена)
 */
export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; role: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, isBanned: true },
      });

      if (user && !user.isBanned) {
        req.user = user;
      }
    }
  } catch (error) {
    // Игнорируем ошибки токена для опциональной аутентификации
  }
  
  next();
};
