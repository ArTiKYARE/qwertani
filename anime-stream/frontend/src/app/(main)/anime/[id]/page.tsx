import { notFound } from 'next/navigation';
import { VideoPlayer } from '@/components/VideoPlayer';
import apiClient from '@/lib/api';
import { Anime, Episode } from '@/types';

interface PageProps {
  params: { id: string };
}

// Получение данных аниме
async function getAnime(id: string): Promise<Anime | null> {
  try {
    const response = await apiClient.get(`/anime/${id}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения аниме:', error);
    return null;
  }
}

export default async function AnimePage({ params }: PageProps) {
  const anime = await getAnime(params.id);

  if (!anime) {
    notFound();
  }

  const firstEpisode = anime.episodes?.[0];

  return (
    <div className="container py-8">
      {/* Баннер */}
      {anime.banner && (
        <div className="relative h-[200px] md:h-[300px] rounded-xl overflow-hidden mb-8">
          <img
            src={anime.banner}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      {/* Заголовок и информация */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{anime.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          {anime.year && <span>{anime.year}</span>}
          <span className={`px-2 py-0.5 rounded ${
            anime.status === 'ONGOING' ? 'bg-green-600 text-white' :
            anime.status === 'COMPLETED' ? 'bg-blue-600 text-white' :
            'bg-purple-600 text-white'
          }`}>
            {anime.status === 'ONGOING' ? 'Онгоинг' :
             anime.status === 'COMPLETED' ? 'Завершен' : 'Анонс'}
          </span>
          {anime.rating && (
            <span className="flex items-center gap-1">
              ⭐ {anime.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {anime.genres.map((genre) => (
            <span
              key={genre}
              className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>

        {anime.description && (
          <p className="text-muted-foreground max-w-4xl">{anime.description}</p>
        )}
      </div>

      {/* Плеер */}
      {firstEpisode ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Смотреть онлайн</h2>
          <VideoPlayer 
            episode={firstEpisode} 
            onEpisodeEnd={() => console.log('Эпизод завершен')}
          />
        </div>
      ) : (
        <div className="mb-8 p-8 bg-card rounded-lg text-center text-muted-foreground">
          Эпизоды скоро появятся
        </div>
      )}

      {/* Список эпизодов */}
      {anime.episodes && anime.episodes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Эпизоды ({anime.episodes.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {anime.episodes.map((episode: Episode) => (
              <a
                key={episode.id}
                href="#"
                className="block p-4 bg-card rounded-lg hover:bg-accent transition-colors text-center"
              >
                <span className="font-medium">Эпизод {episode.number}</span>
                {episode.title && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {episode.title}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
