import { AnimeCard } from '@/components/AnimeCard';
import apiClient from '@/lib/api';
import { Anime } from '@/types';

// Получение популярных аниме для главной страницы
async function getPopularAnime(): Promise<Anime[]> {
  try {
    const response = await apiClient.get('/anime', {
      params: { limit: 8, rating: 7 },
    });
    return response.data.data;
  } catch (error) {
    console.error('Ошибка получения популярных аниме:', error);
    return [];
  }
}

export default async function HomePage() {
  const popularAnime = await getPopularAnime();

  return (
    <div className="container py-8">
      {/* Герой-секция */}
      <section className="mb-12">
        <div className="relative h-[400px] rounded-xl overflow-hidden bg-gradient-to-r from-purple-900 to-blue-900">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Добро пожаловать в AnimeStream
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
                Смотри любимые аниме онлайн в высоком качестве с русской озвучкой
              </p>
              <a
                href="/catalog"
                className="inline-block px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Перейти в каталог
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Популярные аниме */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Популярное сейчас</h2>
        {popularAnime.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {popularAnime.map((anime) => (
              <AnimeCard key={anime.id} {...anime} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Загрузка популярных аниме...
          </div>
        )}
      </section>

      {/* Последние обновления */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Последние обновления</h2>
        <div className="text-center py-12 text-muted-foreground">
          Скоро здесь появятся новые эпизоды
        </div>
      </section>
    </div>
  );
}
