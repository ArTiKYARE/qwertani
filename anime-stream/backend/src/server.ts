import app from './app';
import { config } from './config';
import prisma from './models/prisma';

const PORT = config.port;

async function startServer() {
  try {
    // Проверка подключения к БД
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно');

    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Получен сигнал SIGINT, завершение работы...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Получен сигнал SIGTERM, завершение работы...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
