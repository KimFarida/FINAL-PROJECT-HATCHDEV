import axios, { AxiosError, isAxiosError} from 'axios';
import { CustomError } from './customError';
import { Movie } from '../entities/Movie';
import { TMDBErrorResponse } from '../types/error';
import { Genre } from '../entities/Genre';
import { MovieResponse } from '../types/apiResponse';
import { handleAxiosError } from './handleErrors';
import dotenv from "dotenv";


dotenv.config();

const TDMB_BASE_URL = process.env.TMDB_BASE_URL 
const TDMB_BEARER_TOKEN = process.env.TMDB_TOKEN 

const validateBearerToken = () => {
  if (!TDMB_BEARER_TOKEN) {
    throw new CustomError('TMDB Bearer Token is not configured', 500, 'TMDB_TOKEN_MISSING');
  }
};

const getHeaders = () => {
  validateBearerToken();
  return {
    accept: 'application/json',
    Authorization: `Bearer ${TDMB_BEARER_TOKEN}`,
  };
};


interface DiscoverMoviesParams {
    page?: number;
    sort_by?: string;
    include_adult?: boolean;
    include_video?: boolean;
    language?: string;
    primary_release_date_gte?: string;
    primary_release_date_lte?: string;
    vote_average_gte?: number;
    vote_count_gte?: number;
    with_release_type?: string;
    region?: string;
    with_genres?:string;
    with_runtime_gte?: number;
  }
  
  export const discoverMovies = async (params: DiscoverMoviesParams = {}) => {
    try {
      const defaultParams = {
        include_adult: false,
        include_video: false,
        language: 'en-US',
        page: 1,
        sort_by: 'popularity.desc',
        region: 'US'
      };
  
      const response = await axios.get(`${TDMB_BASE_URL}/discover/movie`, {
        params: { ...defaultParams, ...params },
        headers: getHeaders(),
      });
  
      if (!response.data || !response.data.results) {
        throw new CustomError('Invalid response from TMDB', 500, 'TMDB_INVALID_RESPONSE');
      }
  
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        return handleAxiosError(error);
      }
  
      if (error instanceof CustomError) {
        throw error;
      }
  
      throw new CustomError('Failed to fetch movies', 500, 'TMDB_FETCH_ERROR');
    }
  };
  
  export const getNowPlayingMovies = async (page: number = 1) => {
    const today = new Date();
    const twoWeeksAgo = new Date(today.setDate(today.getDate() - 14));
    const nextWeek = new Date(new Date().setDate(new Date().getDate() + 7));
  
    return discoverMovies({
      page,
      sort_by: 'primary_release_date.desc',
      primary_release_date_gte: twoWeeksAgo.toISOString().split('T')[0],
      primary_release_date_lte: nextWeek.toISOString().split('T')[0],
      with_release_type: '2|3',
      with_runtime_gte: 60, 
    });
  };
  
  export const getPopularMovies = async (page: number = 1) => {
    return discoverMovies({
      page,
      sort_by: 'popularity.desc',
      vote_count_gte: 100, 
    });
  };
  
  export const getTopRatedMovies = async (page: number = 1) => {
    return discoverMovies({
      page,
      sort_by: 'vote_average.desc',
      vote_count_gte: 300, 
      vote_average_gte: 7.0, 
    });
  };
  
  export const getUpcomingMovies = async (page: number = 1) => {
    const today = new Date();
    const sixMonthsFromNow = new Date(today.setMonth(today.getMonth() + 6));
  
    return discoverMovies({
      page,
      sort_by: 'popularity.desc',
      primary_release_date_gte: new Date().toISOString().split('T')[0],
      primary_release_date_lte: sixMonthsFromNow.toISOString().split('T')[0],
      with_release_type: '2|3', // Theatrical & Digital release
    });
  };

export const getMovieByID = async (id: number): Promise<Movie | null> => {
  try {
    if (!id || id <= 0) {
      throw new CustomError('Invalid movie ID', 400, 'INVALID_MOVIE_ID');
    }

    const params = {
      language: 'en-US',
    };

    const response = await axios.get<Movie>(`${TDMB_BASE_URL}/movie/${id}`, {
      params,
      headers: getHeaders(),
    });

    if (!response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    // Check if it's an Axios error
    if (isAxiosError<TMDBErrorResponse>(error)) {
      if (error.response?.status === 404) {
        return null;
      }
      return handleAxiosError(error);
    }

    // Rethrow if it's already a CustomError
    if (error instanceof CustomError) {
      throw error;
    }

    throw new CustomError('Failed to fetch movie details', 500, 'TMDB_FETCH_ERROR');
  }
};

export const getSimilarMovies = async (
  id: number, 
  page: number = 1
): Promise<Movie[] | null> => {
  try {
    if (!id || id <= 0) {
      throw new CustomError('Invalid movie ID', 400, 'INVALID_MOVIE_ID');
    }

    const params = {
      language: 'en-US',
      page,
    };

    const response = await axios.get(`${TDMB_BASE_URL}/movie/${id}/similar`, {
      headers: getHeaders(),
      params,
    });

    if (!response.data || !response.data.results) {
      return null;
    }

    return response.data;
  } catch (error) {
    // Check if it's an Axios error
    if (isAxiosError<TMDBErrorResponse>(error)) {
      // Specifically handle 404 for similar movies not found
      if (error.response?.status === 404) {
        return null;
      }
      return handleAxiosError(error);
    }

    if (error instanceof CustomError) {
      throw error;
    }

    throw new CustomError('Failed to fetch similar movies', 500, 'TMDB_FETCH_ERROR');
  }
};

let cachedGenres: Genre[] | null = null;
export const getMovieGenres = async (): Promise<Genre[] | null> => {
    if (cachedGenres) return cachedGenres;
  try {
    const params = {
      language: 'en',
    };

    const response = await axios.get<{ genres: Genre[] }>(`${TDMB_BASE_URL}/genre/movie/list`, {
      headers: getHeaders(),
      params,
    });

    if (!response.data || !response.data.genres) {
      throw new CustomError('Invalid genres response', 500, 'TMDB_INVALID_GENRES');
    }

    return response.data.genres;
  } catch (error) {
    if (isAxiosError<TMDBErrorResponse>(error)) {
      return handleAxiosError(error);
    }

    if (error instanceof CustomError) {
      throw error;
    }

    throw new CustomError('Failed to fetch movie genres', 500, 'TMDB_FETCH_ERROR');
  }
};

export const searchMovie = async (
  movieTitle: string, 
  page: number = 1
): Promise<MovieResponse> => {
  try {
    // Validate input
    if (!movieTitle || movieTitle.trim() === '') {
      throw new CustomError('Search query is required', 400, 'INVALID_SEARCH_QUERY');
    }

    const params = {
      query: movieTitle,
      language: 'en-US',
      page,
    };

    const response = await axios.get<MovieResponse>(`${TDMB_BASE_URL}/search/movie`, {
      headers: getHeaders(),
      params,
    });

    if (!response.data || !response.data.results) {
      throw new CustomError('Invalid search response', 500, 'TMDB_INVALID_SEARCH');
    }

    return response.data;
  } catch (error) {
    if (isAxiosError<TMDBErrorResponse>(error)) {
      return handleAxiosError(error);
    }
    if (error instanceof CustomError) {
      throw error;
    }

    throw new CustomError('Failed to search movies', 500, 'TMDB_FETCH_ERROR');
  }
};