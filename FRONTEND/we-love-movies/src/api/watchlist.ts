import { api } from './axiosConfig';
import { WatchlistItem } from '../types/interfaces';

export const watchlistService = {
    addToWatchlist: async (
        movieId: number, 
        status: 'planned' | 'watched' | 'watching' = 'planned'
    ): Promise<WatchlistItem> => {
        const response = await api.post<WatchlistItem>('/watchlist', {
            movieId,
            status
        });
        return response.data;
    },

    removeFromWatchlist: async (movieId: number): Promise<void> => {
        await api.delete(`/watchlist/${movieId}`);
    },

    updateStatus: async (
        movieId: number, 
        status: 'planned' | 'watched' | 'watching'
    ): Promise<WatchlistItem> => {
        const response = await api.patch<WatchlistItem>(`/watchlist/${movieId}/status`, {
            status
        });
        return response.data;
    },

    getWatchlist: async (status?: 'planned' | 'watched' | 'watching'): Promise<WatchlistItem[]> => {
        const response = await api.get<any>('/watchlist', {
            params: status ? { status } : undefined
        });
        return response.data;
    },

    isInWatchlist: async (movieId: number): Promise<boolean> => {
        const response = await api.get<{ isInWatchlist: boolean }>(`/watchlist/${movieId}/check`);
        return response.data.isInWatchlist;
    }
};