FROM node:20-alpine

WORKDIR /app

# Установка зависимостей для Prisma
RUN apk add --no-cache openssl

# Копирование package файлов
COPY package*.json ./
COPY prisma ./prisma/

# Установка зависимостей
RUN npm ci

# Генерация Prisma клиента
RUN npx prisma generate

# Копирование исходного кода
COPY . .

# Сборка проекта
RUN npm run build

# Экспорт порта
EXPOSE 5000

# Запуск приложения
CMD ["npm", "start"]
