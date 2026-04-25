import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Запуск сидирования базы данных...');

  // Создание администратора
  const adminPassword = await bcrypt.hash('admin123', 10);
  const moderatorPassword = await bcrypt.hash('moderator123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: adminPassword,
        name: 'Администратор',
        role: 'ADMIN',
      },
    }),
    prisma.user.upsert({
      where: { email: 'moderator@example.com' },
      update: {},
      create: {
        email: 'moderator@example.com',
        password: moderatorPassword,
        name: 'Модератор',
        role: 'MODERATOR',
      },
    }),
    prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        password: userPassword,
        name: 'Пользователь',
        role: 'USER',
      },
    }),
  ]);

  console.log('✅ Пользователи созданы:');
  console.log(`   - Admin: admin@example.com / admin123`);
  console.log(`   - Moderator: moderator@example.com / moderator123`);
  console.log(`   - User: user@example.com / user123`);

  // Создание тестовых аниме
  const animeData = [
    {
      title: 'Атака Титанов',
      description: 'Человечество сражается за выживание против гигантских титанов, которые загнали последних людей за огромные стены.',
      poster: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=AoT',
      banner: 'https://via.placeholder.com/1920x500/1a1a2e/ffffff?text=Attack+on+Titan',
      year: 2013,
      status: 'COMPLETED' as const,
      rating: 9.0,
      genres: ['Экшен', 'Драма', 'Фэнтези'],
    },
    {
      title: 'Клинок, рассекающий демонов',
      description: 'Мальчик становится охотником на демонов, чтобы найти лекарство для своей сестры, превращенной в демона.',
      poster: 'https://via.placeholder.com/300x450/16213e/ffffff?text=KnS',
      banner: 'https://via.placeholder.com/1920x500/16213e/ffffff?text=Demon+Slayer',
      year: 2019,
      status: 'ONGOING' as const,
      rating: 8.7,
      genres: ['Экшен', 'Фэнтези', 'Сёнен'],
    },
    {
      title: 'Ван-Пис',
      description: 'Приключения пиратов во главе с Манки Д. Луффи в поисках легендарного сокровища Ван-Пис.',
      poster: 'https://via.placeholder.com/300x450/0f3460/ffffff?text=OnePiece',
      banner: 'https://via.placeholder.com/1920x500/0f3460/ffffff?text=One+Piece',
      year: 1999,
      status: 'ONGOING' as const,
      rating: 8.9,
      genres: ['Приключения', 'Комедия', 'Сёнен'],
    },
    {
      title: 'Тетрадь Смерти',
      description: 'Школьник находит тетрадь, убивающую любого, чье имя будет в нее записано.',
      poster: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=DeathNote',
      banner: 'https://via.placeholder.com/1920x500/1a1a2e/ffffff?text=Death+Note',
      year: 2006,
      status: 'COMPLETED' as const,
      rating: 9.1,
      genres: ['Триллер', 'Мистика', 'Психология'],
    },
    {
      title: 'Наруто',
      description: 'История ниндзя Наруто Узумаки, который мечтает стать Хокаге — главой своей деревни.',
      poster: 'https://via.placeholder.com/300x450/e94560/ffffff?text=Naruto',
      banner: 'https://via.placeholder.com/1920x500/e94560/ffffff?text=Naruto',
      year: 2002,
      status: 'COMPLETED' as const,
      rating: 8.4,
      genres: ['Экшен', 'Приключения', 'Сёнен'],
    },
  ];

  for (const data of animeData) {
    const anime = await prisma.anime.upsert({
      where: { title: data.title },
      update: data,
      create: {
        ...data,
        episodes: {
          create: Array.from({ length: 5 }, (_, i) => ({
            number: i + 1,
            title: `Эпизод ${i + 1}`,
            sources: {
              create: [
                {
                  playerType: 'iframe',
                  url: `https://example.com/player/${data.title.replace(/\s/g, '')}/${i + 1}`,
                  dubLang: 'ru',
                  translator: 'Студия Аниме',
                },
                {
                  playerType: 'iframe',
                  url: `https://example.com/player/${data.title.replace(/\s/g, '')}/${i + 1}/en`,
                  dubLang: 'en',
                  translator: 'English Subs',
                },
              ],
            },
          })),
        },
      },
    });
    console.log(`✅ Аниме "${anime.title}" создано/обновлено`);
  }

  console.log('\n🎉 Сидирование завершено успешно!');
}

seed()
  .catch((e) => {
    console.error('❌ Ошибка сидирования:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
