import { config } from '../config';

/**
 * Адаптер для получения данных о аниме из внешнего API или моков
 * Использует паттерн Adapter для абстрагирования от конкретного источника данных
 */

interface ExternalAnimeData {
  id: number;
  title: string;
  description?: string;
  poster?: string;
  banner?: string;
  year?: number;
  status: 'ONGOING' | 'COMPLETED' | 'ANNOUNCE';
  rating?: number;
  genres: string[];
  episodes?: Array<{
    number: number;
    title?: string;
    sources?: Array<{
      playerType: string;
      url: string;
      dubLang: string;
      translator?: string;
    }>;
  }>;
}

export class AnimeAdapter {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = config.externalApiUrl;
    this.apiKey = config.externalApiKey;
  }

  /**
   * Получение списка аниме с пагинацией
   */
  async getAnimeList(page: number = 1, limit: number = 20, filters?: {
    genres?: string[];
    year?: { min?: number; max?: number };
    status?: string;
    search?: string;
  }): Promise<{ data: ExternalAnimeData[]; total: number }> {
    // Если внешний API не настроен, возвращаем моки
    if (!this.apiUrl) {
      return this.getMockAnimeList(page, limit, filters);
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.genres && { genres: filters.genres.join(',') }),
        ...(filters?.year?.min && { yearMin: filters.year.min.toString() }),
        ...(filters?.year?.max && { yearMax: filters.year.max.toString() }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.search && { search: filters.search }),
      });

      const response = await fetch(`${this.apiUrl}/anime?${params}`, {
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {},
      });

      if (!response.ok) {
        throw new Error(`Ошибка внешнего API: ${response.status}`);
      }

      const result = await response.json() as { data: ExternalAnimeData[]; total: number };
      
      // Проверка структуры результата
      if (!result.data || typeof result.total !== 'number') {
        throw new Error('Некорректный формат ответа от внешнего API');
      }
      
      return result;
    } catch (error) {
      console.error('Ошибка получения списка аниме из внешнего API:', error);
      // Фоллбэк на моки при ошибке
      return this.getMockAnimeList(page, limit, filters);
    }
  }

  /**
   * Получение деталей конкретного аниме
   */
  async getAnimeDetails(externalId: number): Promise<ExternalAnimeData | null> {
    if (!this.apiUrl) {
      return this.getMockAnimeDetails(externalId);
    }

    try {
      const response = await fetch(`${this.apiUrl}/anime/${externalId}`, {
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {},
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json() as ExternalAnimeData;
      
      // Проверка наличия обязательных полей
      if (!result.id || !result.title) {
        return null;
      }
      
      return result;
    } catch (error) {
      console.error(`Ошибка получения деталей аниме ${externalId}:`, error);
      return this.getMockAnimeDetails(externalId);
    }
  }

  /**
   * Моковые данные для разработки и тестирования
   */
  private getMockAnimeList(page: number = 1, limit: number = 20, filters?: any): { data: ExternalAnimeData[]; total: number } {
    const mockAnime: ExternalAnimeData[] = [
      {
        id: 1,
        title: 'Атака Титанов',
        description: 'Человечество сражается за выживание против гигантских титанов.',
        poster: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=AoT',
        banner: 'https://via.placeholder.com/1920x500/1a1a2e/ffffff?text=Attack+on+Titan',
        year: 2013,
        status: 'COMPLETED',
        rating: 9.0,
        genres: ['Экшен', 'Драма', 'Фэнтези'],
        episodes: Array.from({ length: 25 }, (_, i) => ({
          number: i + 1,
          title: `Эпизод ${i + 1}`,
          sources: [
            { playerType: 'iframe', url: 'https://example.com/player/1', dubLang: 'ru', translator: 'Студия 1' },
            { playerType: 'iframe', url: 'https://example.com/player/1/en', dubLang: 'en', translator: 'Studio 2' },
          ],
        })),
      },
      {
        id: 2,
        title: 'Клинок, рассекающий демонов',
        description: 'Мальчик становится охотником на демонов, чтобы спасти сестру.',
        poster: 'https://via.placeholder.com/300x450/16213e/ffffff?text=KnS',
        banner: 'https://via.placeholder.com/1920x500/16213e/ffffff?text=Demon+Slayer',
        year: 2019,
        status: 'ONGOING',
        rating: 8.7,
        genres: ['Экшен', 'Фэнтези', 'Сёнен'],
        episodes: Array.from({ length: 12 }, (_, i) => ({
          number: i + 1,
          title: `Эпизод ${i + 1}`,
          sources: [
            { playerType: 'iframe', url: 'https://example.com/player/2', dubLang: 'ru', translator: 'Студия 1' },
          ],
        })),
      },
      {
        id: 3,
        title: 'Ван-Пис',
        description: 'Приключения пиратов в поисках сокровищ.',
        poster: 'https://via.placeholder.com/300x450/0f3460/ffffff?text=OnePiece',
        banner: 'https://via.placeholder.com/1920x500/0f3460/ffffff?text=One+Piece',
        year: 1999,
        status: 'ONGOING',
        rating: 8.9,
        genres: ['Приключения', 'Комедия', 'Сёнен'],
        episodes: Array.from({ length: 1000 }, (_, i) => ({
          number: i + 1,
          title: `Эпизод ${i + 1}`,
          sources: [
            { playerType: 'iframe', url: `https://example.com/player/3/${i + 1}`, dubLang: 'ru', translator: 'Студия 1' },
          ],
        })),
      },
      {
        id: 4,
        title: 'Тетрадь Смерти',
        description: 'Школьник находит тетрадь, убивающую людей.',
        poster: 'https://via.placeholder.com/300x450/1a1a2e/ffffff?text=DeathNote',
        banner: 'https://via.placeholder.com/1920x500/1a1a2e/ffffff?text=Death+Note',
        year: 2006,
        status: 'COMPLETED',
        rating: 9.1,
        genres: ['Триллер', 'Мистика', 'Психология'],
        episodes: Array.from({ length: 37 }, (_, i) => ({
          number: i + 1,
          title: `Эпизод ${i + 1}`,
          sources: [
            { playerType: 'iframe', url: 'https://example.com/player/4', dubLang: 'ru', translator: 'Студия 1' },
          ],
        })),
      },
      {
        id: 5,
        title: 'Наруто',
        description: 'История ниндзя, стремящегося стать Хокаге.',
        poster: 'https://via.placeholder.com/300x450/e94560/ffffff?text=Naruto',
        banner: 'https://via.placeholder.com/1920x500/e94560/ffffff?text=Naruto',
        year: 2002,
        status: 'COMPLETED',
        rating: 8.4,
        genres: ['Экшен', 'Приключения', 'Сёнен'],
        episodes: Array.from({ length: 220 }, (_, i) => ({
          number: i + 1,
          title: `Эпизод ${i + 1}`,
          sources: [
            { playerType: 'iframe', url: 'https://example.com/player/5', dubLang: 'ru', translator: 'Студия 1' },
          ],
        })),
      },
    ];

    // Применение фильтров
    let filtered = mockAnime;

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(a => a.title.toLowerCase().includes(searchLower));
    }

    if (filters?.genres && filters.genres.length > 0) {
      filtered = filtered.filter(a => 
        filters.genres!.some((g: string) => a.genres.includes(g))
      );
    }

    if (filters?.status) {
      filtered = filtered.filter(a => a.status === filters.status);
    }

    if (filters?.year) {
      filtered = filtered.filter(a => {
        if (!a.year) return false;
        if (filters.year.min && a.year < filters.year.min) return false;
        if (filters.year.max && a.year > filters.year.max) return false;
        return true;
      });
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return { data: paginated, total };
  }

  private getMockAnimeDetails(externalId: number): ExternalAnimeData | null {
    const { data } = this.getMockAnimeList(1, 100);
    return data.find(a => a.id === externalId) || null;
  }
}

export const animeAdapter = new AnimeAdapter();
export default animeAdapter;
