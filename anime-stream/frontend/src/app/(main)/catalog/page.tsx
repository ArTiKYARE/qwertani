'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAnimeList } from '@/hooks/useAnimeList';
import { AnimeCard } from '@/components/AnimeCard';
import { Anime } from '@/types';

const GENRES = [
  'Экшен', 'Приключения', 'Комедия', 'Драма', 'Фэнтези', 
  'Мистика', 'Психология', 'Сёнен', 'Романтика', 'Триллер'
];

const STATUS_OPTIONS = [
  { value: 'ONGOING', label: 'Онгоинг' },
  { value: 'COMPLETED', label: 'Завершен' },
  { value: 'ANNOUNCE', label: 'Анонс' },
];

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Состояние фильтров из URL
  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    search: searchParams.get('search') || '',
    genres: searchParams.get('genres')?.split(',') || [],
    status: searchParams.get('status') || '',
    yearMin: searchParams.get('yearMin') ? parseInt(searchParams.get('yearMin')!) : undefined,
    yearMax: searchParams.get('yearMax') ? parseInt(searchParams.get('yearMax')!) : undefined,
  });

  const { data, total, totalPages, loading, error } = useAnimeList({
    page: filters.page,
    limit: 24,
    genres: filters.genres.length > 0 ? filters.genres : undefined,
    status: filters.status || undefined,
    search: filters.search || undefined,
    yearMin: filters.yearMin,
    yearMax: filters.yearMax,
  });

  // Обновление URL при изменении фильтров
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);

    const params = new URLSearchParams();
    if (updated.search) params.set('search', updated.search);
    if (updated.genres.length > 0) params.set('genres', updated.genres.join(','));
    if (updated.status) params.set('status', updated.status);
    if (updated.yearMin) params.set('yearMin', updated.yearMin.toString());
    if (updated.yearMax) params.set('yearMax', updated.yearMax.toString());
    if (updated.page > 1) params.set('page', updated.page.toString());

    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleGenre = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    updateFilters({ genres: newGenres });
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Каталог аниме</h1>

      {/* Фильтры */}
      <div className="mb-8 space-y-6">
        {/* Поиск */}
        <div>
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full md:w-96 px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Жанры */}
        <div>
          <label className="block text-sm font-medium mb-2">Жанры</label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  filters.genres.includes(genre)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Статус */}
        <div>
          <label className="block text-sm font-medium mb-2">Статус</label>
          <select
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Все</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Список аниме */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Загрузка...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">
          Ошибка загрузки: {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {data.map((anime: Anime) => (
              <AnimeCard key={anime.id} {...anime} />
            ))}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80"
              >
                Назад
              </button>
              
              <span className="text-sm text-muted-foreground">
                Страница {filters.page} из {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === totalPages}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80"
              >
                Вперед
              </button>
            </div>
          )}

          {/* Всего найдено */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Найдено: {total} аниме
          </p>
        </>
      )}
    </div>
  );
}
