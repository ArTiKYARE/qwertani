import { Router } from 'express';
import prisma from '../models/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { getCached, invalidateCache } from '../utils/redis';
import { z } from 'zod';

const router = Router();

// Схема валидации для фильтров
const animeFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  genres: z.string().optional(),
  yearMin: z.coerce.number().optional(),
  yearMax: z.coerce.number().optional(),
  status: z.enum(['ONGOING', 'COMPLETED', 'ANNOUNCE']).optional(),
  search: z.string().optional(),
  rating: z.coerce.number().min(0).max(10).optional(),
});

/**
 * GET /api/anime
 * Получение списка аниме с фильтрами и пагинацией
 */
router.get('/', async (req, res) => {
  try {
    // Парсинг и валидация query параметров
    const validated = animeFiltersSchema.parse(req.query);
    
    const { page, limit, genres, yearMin, yearMax, status, search, rating } = validated;
    const skip = (page - 1) * limit;

    // Формирование условий фильтрации
    const where: any = {};

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (genres) {
      const genreList = genres.split(',');
      where.genres = { hasSome: genreList };
    }

    if (yearMin || yearMax) {
      where.year = {};
      if (yearMin) where.year.gte = yearMin;
      if (yearMax) where.year.lte = yearMax;
    }

    if (status) {
      where.status = status;
    }

    if (rating) {
      where.rating = { gte: rating };
    }

    // Кэширование запроса
    const cacheKey = `anime:list:${JSON.stringify(validated)}`;
    
    const result = await getCached(
      cacheKey,
      async () => {
        const [data, total] = await Promise.all([
          prisma.anime.findMany({
            where,
            skip,
            take: limit,
            orderBy: { rating: 'desc' },
            select: {
              id: true,
              title: true,
              poster: true,
              year: true,
              status: true,
              rating: true,
              genres: true,
              _count: {
                select: { episodes: true },
              },
            },
          }),
          prisma.anime.count({ where }),
        ]);

        return { data, total };
      },
      300 // TTL 5 минут
    );

    res.json({
      data: result.data,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Неверные параметры фильтрации', details: error.errors });
    }
    console.error('Ошибка получения списка аниме:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * GET /api/anime/:id
 * Получение деталей конкретного аниме
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `anime:details:${id}`;

    const anime = await getCached(
      cacheKey,
      async () => {
        return prisma.anime.findUnique({
          where: { id },
          include: {
            episodes: {
              orderBy: { number: 'asc' },
              include: {
                sources: true,
              },
            },
          },
        });
      },
      600 // TTL 10 минут
    );

    if (!anime) {
      return res.status(404).json({ error: 'Аниме не найдено' });
    }

    res.json(anime);
  } catch (error) {
    console.error('Ошибка получения деталей аниме:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * GET /api/anime/genres
 * Получение списка всех жанров
 */
router.get('/genres', async (req, res) => {
  try {
    const cacheKey = 'anime:genres';

    const genres = await getCached(
      cacheKey,
      async () => {
        const allAnime = await prisma.anime.findMany({
          select: { genres: true },
        });

        const genreSet = new Set<string>();
        allAnime.forEach(anime => {
          anime.genres.forEach(genre => genreSet.add(genre));
        });

        return Array.from(genreSet).sort();
      },
      3600 // TTL 1 час
    );

    res.json(genres);
  } catch (error) {
    console.error('Ошибка получения жанров:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * POST /api/anime
 * Создание нового аниме (только админ/модератор)
 */
router.post('/', authenticate, authorize('ADMIN', 'MODERATOR'), async (req: AuthRequest, res) => {
  try {
    const { title, description, poster, banner, year, status, rating, genres, episodes } = req.body;

    const anime = await prisma.anime.create({
      data: {
        title,
        description,
        poster,
        banner,
        year,
        status,
        rating,
        genres,
        episodes: episodes ? {
          create: episodes.map((ep: any) => ({
            number: ep.number,
            title: ep.title,
            sources: ep.sources ? {
              create: ep.sources.map((src: any) => ({
                playerType: src.playerType,
                url: src.url,
                dubLang: src.dubLang,
                translator: src.translator,
              })),
            } : undefined,
          })),
        } : undefined,
      },
      include: {
        episodes: {
          include: {
            sources: true,
          },
        },
      },
    });

    // Инвалидация кэша
    await invalidateCache('anime:*');

    res.status(201).json(anime);
  } catch (error) {
    console.error('Ошибка создания аниме:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * PUT /api/anime/:id
 * Обновление аниме (только админ/модератор)
 */
router.put('/:id', authenticate, authorize('ADMIN', 'MODERATOR'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const anime = await prisma.anime.update({
      where: { id },
      data: updateData,
    });

    // Инвалидация кэша
    await invalidateCache(`anime:details:${id}`);
    await invalidateCache('anime:list:*');

    res.json(anime);
  } catch (error) {
    console.error('Ошибка обновления аниме:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * DELETE /api/anime/:id
 * Удаление аниме (только админ)
 */
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.anime.delete({
      where: { id },
    });

    // Инвалидация кэша
    await invalidateCache(`anime:details:${id}`);
    await invalidateCache('anime:list:*');

    res.json({ message: 'Аниме удалено' });
  } catch (error) {
    console.error('Ошибка удаления аниме:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
