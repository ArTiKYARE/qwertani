import Redis from 'ioredis';
import { config } from '../config';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? new Redis(config.redisUrl);

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Утилита для кэширования с TTL
export async function getCached<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = 300): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }

    const data = await fetchFn();
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error(`Ошибка кэша Redis для ключа ${key}:`, error);
    // Если кэш не работает, просто возвращаем данные из функции
    return fetchFn();
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`Ошибка инвалидации кэша для паттерна ${pattern}:`, error);
  }
}

export default redis;
