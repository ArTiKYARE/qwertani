export interface Anime {
  id: string;
  title: string;
  description?: string;
  poster?: string;
  banner?: string;
  year?: number;
  status: 'ONGOING' | 'COMPLETED' | 'ANNOUNCE';
  rating?: number;
  genres: string[];
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  number: number;
  title?: string;
  sources: VideoSource[];
}

export interface VideoSource {
  id: string;
  playerType: string;
  url: string;
  dubLang: string;
  translator?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'avatar' | 'role'>;
  animeId: string;
  parentId?: string;
  replies?: Comment[];
  likes: number;
  isDeleted: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface AnimeListResponse {
  data: Anime[];
  total: number;
  page: number;
  totalPages: number;
}
