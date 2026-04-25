import { cn } from '@/lib/utils';

interface AnimeCardProps {
  id: string;
  title: string;
  poster?: string;
  year?: number;
  status: 'ONGOING' | 'COMPLETED' | 'ANNOUNCE';
  rating?: number;
  genres: string[];
  className?: string;
}

const statusLabels = {
  ONGOING: 'Онгоинг',
  COMPLETED: 'Завершен',
  ANNOUNCE: 'Анонс',
};

const statusColors = {
  ONGOING: 'bg-green-600',
  COMPLETED: 'bg-blue-600',
  ANNOUNCE: 'bg-purple-600',
};

export function AnimeCard({ 
  id, 
  title, 
  poster, 
  year, 
  status, 
  rating, 
  genres,
  className 
}: AnimeCardProps) {
  return (
    <a 
      href={`/anime/${id}`}
      className={cn(
        'group block bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      {/* Постер */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">Нет постера</span>
          </div>
        )}
        
        {/* Статус */}
        <span className={cn(
          'absolute top-2 left-2 px-2 py-1 text-xs font-medium text-white rounded',
          statusColors[status]
        )}>
          {statusLabels[status]}
        </span>
        
        {/* Рейтинг */}
        {rating && (
          <span className="absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white bg-yellow-600 rounded">
            ⭐ {rating.toFixed(1)}
          </span>
        )}
      </div>
      
      {/* Информация */}
      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          {year && <span>{year}</span>}
          <span>{genres.slice(0, 2).join(', ')}{genres.length > 2 ? '...' : ''}</span>
        </div>
      </div>
    </a>
  );
}
