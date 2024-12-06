import { api } from './axiosConfig';
import { MovieResponse, Movie, Genre } from '../types/interfaces';

export const tmdbService = {
    getMovies: async (listType: string, page: number = 1): Promise<MovieResponse> => {
        let endpoint = '/movies';
        switch(listType) {
            case 'now-playing':
                endpoint = `${endpoint}/discover`;
                break;
            case 'top-rated':
                endpoint = `${endpoint}/top-rated`;
                break;
            case 'upcoming':
                endpoint = `${endpoint}/upcoming`;
                break;
            case 'recently-watched':
                endpoint = '/user/recently-watched';
                const response = await api.get<any>(endpoint);
                return {
                    results: response.data,
                    page: 1,
                    total_pages: 1,
                    total_results: response.data.length
                }
            default:
                endpoint = `${endpoint}/discover`;
        }

        const response = await api.get<MovieResponse>(`${endpoint}`, {
            params: { page }
        });

        return response.data;
    },

    searchMovies: async (query: string, page: number = 1): Promise<MovieResponse> => {
        const response = await api.get<MovieResponse>('/movies/search', {
            params: {
                query,
                page
            }
        });
        return response.data;
    },

    getGenres: async (): Promise<Genre[]> => {
        const response = await api.get<any>('movies/genres');
        return response.data;
    },

    getMovieById: async (id: number): Promise<Movie> => {
        const response = await api.get<Movie>(`movies/${id}`);
        return response.data;
    },

    getSimilarMovies: async (id: number, page: number = 1): Promise<MovieResponse> => {
        const response = await api.get<MovieResponse>(`movies/${id}/similar`, {
            params: { page }
        });
        return response.data;
    }
};