'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { Anime, AnimeListResponse } from '@/types';

interface UseAnimeListParams {
  page?: number;
  limit?: number;
  genres?: string[];
  yearMin?: number;
  yearMax?: number;
  status?: string;
  search?: string;
  rating?: number;
}

export function useAnimeList(params: UseAnimeListParams = {}) {
  const [data, setData] = useState<Anime[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnime = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.set('page', params.page.toString());
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.genres?.length) queryParams.set('genres', params.genres.join(','));
      if (params.yearMin) queryParams.set('yearMin', params.yearMin.toString());
      if (params.yearMax) queryParams.set('yearMax', params.yearMax.toString());
      if (params.status) queryParams.set('status', params.status);
      if (params.search) queryParams.set('search', params.search);
      if (params.rating) queryParams.set('rating', params.rating.toString());

      const response = await apiClient.get<AnimeListResponse>(`/anime?${queryParams}`);
      
      setData(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnime();
  }, [
    params.page,
    params.limit,
    params.genres?.join(','),
    params.yearMin,
    params.yearMax,
    params.status,
    params.search,
    params.rating,
  ]);

  return {
    data,
    total,
    totalPages,
    loading,
    error,
    refetch: fetchAnime,
  };
}
