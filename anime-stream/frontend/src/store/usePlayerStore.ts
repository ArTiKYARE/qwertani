import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EpisodeSource {
  id: string;
  playerType: string;
  url: string;
  dubLang: string;
  translator?: string;
}

interface Episode {
  id: string;
  number: number;
  title?: string;
  sources: EpisodeSource[];
}

interface PlayerState {
  currentEpisode: Episode | null;
  currentSource: EpisodeSource | null;
  isPlaying: boolean;
  autoPlayNext: boolean;
  defaultDubLang: string;
  
  // Actions
  setEpisode: (episode: Episode) => void;
  setSource: (source: EpisodeSource) => void;
  togglePlay: () => void;
  setAutoPlayNext: (value: boolean) => void;
  setDefaultDubLang: (lang: string) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      currentEpisode: null,
      currentSource: null,
      isPlaying: false,
      autoPlayNext: true,
      defaultDubLang: 'ru',

      setEpisode: (episode) => {
        // При смене эпизода выбираем источник по умолчанию
        const defaultSource = episode.sources.find(
          (s) => s.dubLang === get().defaultDubLang
        ) || episode.sources[0];
        
        set({
          currentEpisode: episode,
          currentSource: defaultSource || null,
          isPlaying: true,
        });
      },

      setSource: (source) => {
        set({ currentSource: source });
      },

      togglePlay: () => {
        set((state) => ({ isPlaying: !state.isPlaying }));
      },

      setAutoPlayNext: (value) => {
        set({ autoPlayNext: value });
      },

      setDefaultDubLang: (lang) => {
        set({ defaultDubLang: lang });
      },

      reset: () => {
        set({
          currentEpisode: null,
          currentSource: null,
          isPlaying: false,
        });
      },
    }),
    {
      name: 'player-settings',
      partialize: (state) => ({
        autoPlayNext: state.autoPlayNext,
        defaultDubLang: state.defaultDubLang,
      }),
    }
  )
);

// Хук для получения текущего состояния store
const get = () => usePlayerStore.getState();

export default usePlayerStore;
