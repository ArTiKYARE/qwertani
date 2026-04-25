# AnimeStream — Веб-сервис для просмотра аниме

## 📋 Описание

Полнофункциональный веб-сервис для просмотра аниме с поддержкой:
- Просмотр без регистрации
- Авторизация для комментариев, избранного и истории просмотров
- Админ-панель с ролевой моделью (admin, moderator, user)
- Интеграция с внешним API (или моковые данные)
- Кэширование через Redis
- Адаптивный UI с тёмной темой

## 🏗 Архитектура проекта

```
anime-stream/
├── docker-compose.yml          # Оркестрация сервисов
├── .env.example                # Шаблон переменных окружения
├── backend/                    # Node.js + Express + Prisma
│   ├── src/
│   │   ├── config/             # Конфигурация
│   │   ├── controllers/        # Контроллеры
│   │   ├── middleware/         # Auth, rate limiting
│   │   ├── models/             # Prisma клиент
│   │   ├── routes/             # API маршруты
│   │   ├── services/           # Бизнес-логика, адаптеры
│   │   ├── utils/              # Утилиты (Redis, seed)
│   │   ├── app.ts              # Express приложение
│   │   └── server.ts           # Точка входа
│   ├── prisma/
│   │   └── schema.prisma       # Схема БД
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
└── frontend/                   # Next.js 14 + React + TailwindCSS
    ├── src/
    │   ├── app/                # App Router страницы
    │   │   ├── (main)/         # Основной лейаут
    │   │   │   ├── page.tsx    # Главная страница
    │   │   │   ├── catalog/    # Каталог с фильтрами
    │   │   │   └── anime/[id]/ # Страница аниме
    │   │   ├── admin/          # Админ-панель
    │   │   ├── layout.tsx      # Корневой лейаут
    │   │   └── globals.css     # Глобальные стили
    │   ├── components/         # UI компоненты
    │   ├── hooks/              # Custom хуки
    │   ├── lib/                # Утилиты, API клиент
    │   ├── store/              # Zustand store
    │   └── types/              # TypeScript типы
    ├── package.json
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── Dockerfile
```

## 🚀 Быстрый запуск

### Вариант 1: Docker Compose (рекомендуется)

```bash
# Клонирование репозитория
cd anime-stream

# Копирование переменных окружения
cp .env.example .env

# Запуск всех сервисов
docker-compose up --build

# Доступ к приложению:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5000
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

### Вариант 2: Локальная разработка

#### Бэкенд

```bash
cd backend

# Установка зависимостей
npm install

# Копирование .env
cp ../.env.example .env

# Генерация Prisma клиента
npx prisma generate

# Запуск миграций
npx prisma migrate dev

# Сидирование БД (создание тестовых данных)
npm run seed

# Запуск в режиме разработки
npm run dev
```

#### Фронтенд

```bash
cd frontend

# Установка зависимостей
npm install

# Копирование .env
cp .env.local.example .env.local

# Запуск в режиме разработки
npm run dev
```

## 🔑 Тестовые учётные данные

После выполнения `npm run seed` в бэкенде создаются:

| Роль | Email | Пароль |
|------|-------|--------|
| Admin | admin@example.com | admin123 |
| Moderator | moderator@example.com | moderator123 |
| User | user@example.com | user123 |

## 📡 API Endpoints

### Аниме

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|--------|
| GET | `/api/anime` | Список аниме с фильтрами | Публичный |
| GET | `/api/anime/:id` | Детали аниме | Публичный |
| GET | `/api/anime/genres` | Список жанров | Публичный |
| POST | `/api/anime` | Создание аниме | Admin/Mod |
| PUT | `/api/anime/:id` | Обновление аниме | Admin/Mod |
| DELETE | `/api/anime/:id` | Удаление аниме | Admin |

### Авторизация

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|--------|
| POST | `/api/auth/register` | Регистрация | Публичный |
| POST | `/api/auth/login` | Вход | Публичный |
| POST | `/api/auth/refresh` | Обновление токена | Публичный |
| POST | `/api/auth/logout` | Выход | Требуется токен |
| GET | `/api/auth/me` | Данные пользователя | Требуется токен |

### Комментарии

| Метод | Endpoint | Описание | Доступ |
|-------|----------|----------|--------|
| GET | `/api/comments/anime/:id` | Комментарии к аниме | Публичный |
| POST | `/api/comments` | Создать комментарий | Требуется токен |
| PUT | `/api/comments/:id/like` | Лайк комментария | Требуется токен |
| DELETE | `/api/comments/:id` | Удалить комментарий | Автор/Mod/Admin |

## 🗄 Структура базы данных

### Основные модели:

- **User** — пользователи (email, password, role, isBanned)
- **Anime** — тайтлы аниме (title, description, poster, genres, status, rating)
- **Episode** — эпизоды (number, title, animeId)
- **VideoSource** — источники видео (url, playerType, dubLang, translator)
- **Comment** — комментарии (text, userId, animeId, parentId, likes)
- **Favorite** — избранное (userId, animeId)
- **WatchHistory** — история просмотров (userId, animeId, episodeId)

## 🔧 Переменные окружения

### Backend (.env)

```env
# База данных
DATABASE_URL=postgresql://anime_user:anime_password@localhost:5432/anime_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT секреты (ЗАМЕНИТЕ НА СВОИ!)
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key

# Внешнее API (опционально)
EXTERNAL_API_URL=
EXTERNAL_API_KEY=

# Порт
PORT=5000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🎨 Технологии

### Backend
- **Node.js** + **Express** — сервер
- **TypeScript** — типизация
- **Prisma** — ORM для PostgreSQL
- **Redis** — кэширование
- **JWT** — аутентификация
- **Zod** — валидация данных
- **bcryptjs** — хэширование паролей

### Frontend
- **Next.js 14** (App Router) — фреймворк
- **React 18** — UI библиотека
- **TypeScript** — типизация
- **TailwindCSS** — стилизация
- **Zustand** — управление состоянием
- **Axios** — HTTP клиент

## 📦 Деплой

### Production Docker Compose

```yaml
# Измените docker-compose.yml для production:
# - Уберите volumes для кода
# - Используйте готовые образы
# - Настройте переменные окружения
# - Добавьте nginx reverse proxy
```

### Рекомендации по безопасности

1. **Замените все секреты** в .env на уникальные значения
2. **Используйте HTTPS** в production
3. **Настройте CORS** для вашего домена
4. **Включите rate limiting** на уровне nginx/cloudflare
5. **Регулярно обновляйте зависимости**

## 🔌 Интеграция с внешним API

Для подключения реального API аниме (Anilist, Kitsu и др.):

1. Отредактируйте `backend/src/services/animeAdapter.ts`
2. Укажите `EXTERNAL_API_URL` и `EXTERNAL_API_KEY` в .env
3. Адаптируйте маппинг данных под структуру внешнего API

## 📝 Лицензия

MIT
