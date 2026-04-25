'use client';

import { useEffect, useState } from 'react';
import usePlayerStore from '@/store/usePlayerStore';
import { Episode } from '@/types';

interface VideoPlayerProps {
  episode: Episode;
  onEpisodeEnd?: () => void;
}

export function VideoPlayer({ episode, onEpisodeEnd }: VideoPlayerProps) {
  const { currentSource, setEpisode, setSource, defaultDubLang } = usePlayerStore();
  const [availableDubs, setAvailableDubs] = useState<string[]>([]);

  useEffect(() => {
    setEpisode(episode);
    
    // Получаем уникальные языки озвучки
    const dubs = Array.from(new Set(episode.sources.map(s => s.dubLang)));
    setAvailableDubs(dubs);
  }, [episode, setEpisode]);

  // Фильтруем источники по выбранному языку
  const filteredSources = episode.sources.filter(s => s.dubLang === (currentSource?.dubLang || defaultDubLang));

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      {/* Плеер */}
      <div className="relative aspect-video">
        {currentSource ? (
          currentSource.playerType === 'iframe' ? (
            <iframe
              src={currentSource.url}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title="Video Player"
            />
          ) : (
            <video
              src={currentSource.url}
              className="w-full h-full"
              controls
              autoPlay
              onEnded={onEpisodeEnd}
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            Выберите источник видео
          </div>
        )}
      </div>

      {/* Панель управления источниками и озвучкой */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex flex-wrap gap-4">
          {/* Выбор озвучки */}
          {availableDubs.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Озвучка:</label>
              <select
                value={currentSource?.dubLang || defaultDubLang}
                onChange={(e) => {
                  const newSource = episode.sources.find(s => s.dubLang === e.target.value);
                  if (newSource) setSource(newSource);
                }}
                className="bg-background border border-input rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {availableDubs.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === 'ru' ? 'Русская' : lang === 'en' ? 'Английская' : lang === 'jp' ? 'Японская' : lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Выбор источника */}
          {filteredSources.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Источник:</label>
              <select
                value={currentSource?.id || ''}
                onChange={(e) => {
                  const source = episode.sources.find(s => s.id === e.target.value);
                  if (source) setSource(source);
                }}
                className="bg-background border border-input rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {filteredSources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.translator || source.playerType}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Информация о текущем эпизоде */}
        <div className="mt-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Эпизод {episode.number}</span>
          {episode.title && <span className="ml-2">— {episode.title}</span>}
          {currentSource?.translator && (
            <span className="ml-2 text-xs">({currentSource.translator})</span>
          )}
        </div>
      </div>
    </div>
  );
}
