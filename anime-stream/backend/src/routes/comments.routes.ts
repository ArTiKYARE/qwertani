import { Router } from 'express';
import prisma from '../models/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Схема валидации для создания комментария
const createCommentSchema = z.object({
  text: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

/**
 * GET /api/comments/anime/:animeId
 * Получение комментариев для конкретного аниме
 */
router.get('/anime/:animeId', async (req, res) => {
  try {
    const { animeId } = req.params;
    const { page = '1', limit = '20', sortBy = 'createdAt' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const comments = await prisma.comment.findMany({
      where: {
        animeId,
        parentId: null, // Только корневые комментарии
        isDeleted: false,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, role: true },
        },
        replies: {
          where: { isDeleted: false },
          include: {
            user: {
              select: { id: true, name: true, avatar: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: {
        [sortBy as string]: sortBy === 'likes' ? 'desc' : 'desc',
      },
      skip,
      take: limitNum,
    });

    const total = await prisma.comment.count({
      where: {
        animeId,
        parentId: null,
        isDeleted: false,
      },
    });

    res.json({
      data: comments,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Ошибка получения комментариев:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * POST /api/comments
 * Создание комментария (требуется авторизация)
 */
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { text, animeId, parentId } = req.body;

    // Валидация
    const validated = createCommentSchema.parse({ text, parentId });

    if (!animeId) {
      return res.status(400).json({ error: 'Требуется animeId' });
    }

    // Проверка существования аниме
    const anime = await prisma.anime.findUnique({
      where: { id: animeId },
    });

    if (!anime) {
      return res.status(404).json({ error: 'Аниме не найдено' });
    }

    // Если есть parentId, проверяем существование родительского комментария
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.animeId !== animeId) {
        return res.status(404).json({ error: 'Родительский комментарий не найден' });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        text: validated.text,
        userId: req.user!.id,
        animeId,
        parentId: validated.parentId,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Неверные данные', details: error.errors });
    }
    console.error('Ошибка создания комментария:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * PUT /api/comments/:id/like
 * Лайк комментария (требуется авторизация)
 */
router.put('/:id/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.update({
      where: { id },
      data: {
        likes: { increment: 1 },
      },
    });

    res.json(comment);
  } catch (error) {
    console.error('Ошибка лайка комментария:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * DELETE /api/comments/:id
 * Удаление комментария (автор или модератор/админ)
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Комментарий не найден' });
    }

    // Проверка прав: автор комментария или модератор/админ
    if (comment.userId !== userId && userRole !== 'MODERATOR' && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }

    // Мягкое удаление
    await prisma.comment.update({
      where: { id },
      data: {
        isDeleted: true,
        text: '[Комментарий удален]',
      },
    });

    res.json({ message: 'Комментарий удален' });
  } catch (error) {
    console.error('Ошибка удаления комментария:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
