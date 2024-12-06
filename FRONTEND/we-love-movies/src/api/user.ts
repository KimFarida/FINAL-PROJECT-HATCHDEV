import { api } from './axiosConfig';
import { User, Movie, PreferenceResponse, PreferenceUpdates, MovieRecommendation } from '../types/interfaces'
import { StreakStats, WatchTime} from '../types/interfaces';

interface WatchedMoviesResponse {
    watchedMovies: number[];
}



export const userService = {
    getProfile: async (): Promise<User> => {
        const response = await api.get<User>('/user/profile');
        return response.data;
    },

    getStreakStats: async (): Promise<StreakStats> => {
        const response = await api.get<StreakStats>('/user/streak');
        return response.data;
    },

    recordWatch: async (): Promise<StreakStats> => {
        const response = await api.post<StreakStats>('/user/streak');
        return response.data;
    },

    addToRecentlyWatched: async (movieId: number): Promise<number[]> => {
        const response = await api.post<WatchedMoviesResponse>('/user/recently-watched', { movieId });
        return response.data.watchedMovies;
    },

    getRecentlyWatched: async (): Promise<Movie[]> => {
        const response = await api.get<Movie[]>('/user/recently-watched');
        return response.data;
    },

    // New unified preference methods
    getAllPreferences: async (): Promise<PreferenceResponse> => {
        const response = await api.get<PreferenceResponse>('/user/preferences');
        return response.data;
    },

    updatePreferences: async (updates: PreferenceUpdates): Promise<PreferenceResponse> => {
        const response = await api.put<PreferenceResponse>('/user/preferences', updates);
        return response.data;
    },

    // Helper method for just updating genres
    updateGenres: async (genreIds: number[]): Promise<PreferenceResponse> => {
        return userService.updatePreferences({ favoriteGenres: genreIds });
    },

    // Helper method for just updating watch time
    updateWatchTime: async (watchTime: WatchTime): Promise<PreferenceResponse> => {
        return userService.updatePreferences({ watchTime });
    },

    getRecommendations: async (mood?: string): Promise<MovieRecommendation[]> => {
        const params = mood ? { mood } : {};
        const response = await api.get<MovieRecommendation[]>('/user/recommendations', { params });
        return response.data;
    },

    // If you want to get recommendations without mood separately
    getBasicRecommendations: async (): Promise<MovieRecommendation[]> => {
        const response = await api.get<MovieRecommendation[]>('/user/recommendations');
        return response.data;
    },

    // Get recommendations with specific mood
    getMoodRecommendations: async (mood: string): Promise<MovieRecommendation[]> => {
        const response = await api.get<MovieRecommendation[]>('/user/recommendations', {
            params: { mood }
        });
        return response.data;
    }

    // You can add a helper method for moods later
    // updateMoods: async (moods: Mood[]): Promise<PreferenceResponse> => {
    //     return userService.updatePreferences({ moods });
    // }


    // For future implementation
    // updateProfile: async (userData: Partial<User>): Promise<User> => {
    //     const response = await api.put<User>('/user/profile', userData);
    //     return response.data;
    // },

    // changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    //     await api.put('/user/change-password', { oldPassword, newPassword });
    // },

    // updateAvatar: async (avatarData: FormData): Promise<User> => {
    //     const response = await api.put<User>('/user/avatar', avatarData, {
    //         headers: {
    //             'Content-Type': 'multipart/form-data',
    //         },
    //     });
    //     return response.data;
    // }
};