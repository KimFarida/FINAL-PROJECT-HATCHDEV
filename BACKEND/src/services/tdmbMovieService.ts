import { CustomError } from '../utils/customError';
import { 
  discoverMovies,
  getNowPlayingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getMovieByID, 
  getSimilarMovies, 
  getMovieGenres, 
  searchMovie 
} from '../utils/tmdbApiClient';

interface MovieServiceResponse {
  page?: number;
  results: any[];
  total_pages?: number;
  total_results?: number;
}

interface DiscoverMoviesParams {
  page?: number;
  sort_by?: string;
  language?:string;
  include_adult?:boolean;
  with_genres?: string;
  vote_average_gte?: number;
  vote_count_gte?: number;
  with_runtime?: { gte?: number; lte?: number };
  without_genres?: string; // Genres to explicitly exclude
  release_date?: { gte?: string; lte?: string };
  with_original_language?: string;
  with_keywords?: string;
  
}

export class TMDBMovieService {
  static async fetchDiscoverMovies(page: number = 1, params?: DiscoverMoviesParams) {
    try {
      const response = await discoverMovies({ 
        page,
        ...params
      });
      return {
        results: response.results,
        page: response.page,
        total_pages: response.total_pages,
        total_results: response.total_results
      };
    } catch (error) {
      console.error('Error in fetchDiscoverMovies service:', error);
      throw new CustomError('Failed to fetch discover movies', 500, 'TMDB_DISCOVER_ERROR');
    }
  }

  static async fetchNowPlayingMovies(page: number = 1) {
    try {
      const movies = await getNowPlayingMovies(page);
      if (!movies) {
        throw new CustomError('Now playing movies not found', 404, 'NOW_PLAYING_NOT_FOUND');
      }
      return movies;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error('Error in fetchNowPlayingMovies service:', error);
      throw new CustomError('Failed to fetch now playing movies', 500, 'TMDB_NOW_PLAYING_ERROR');
    }
  }

  static async fetchPopularMovies(page: number = 1) {
    try {
      const movies = await getPopularMovies(page);
      if (!movies) {
        throw new CustomError('Popular movies not found', 404, 'POPULAR_MOVIES_NOT_FOUND');
      }
      return movies;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error('Error in fetchPopularMovies service:', error);
      throw new CustomError('Failed to fetch popular movies', 500, 'TMDB_POPULAR_MOVIES_ERROR');
    }
  }

  static async fetchTopRatedMovies(page: number = 1) {
    try {
      const movies = await getTopRatedMovies(page);
      if (!movies) {
        throw new CustomError('Top rated movies not found', 404, 'TOP_RATED_NOT_FOUND');
      }
      return movies;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error('Error in fetchTopRatedMovies service:', error);
      throw new CustomError('Failed to fetch top rated movies', 500, 'TMDB_TOP_RATED_ERROR');
    }
  }

  static async fetchUpcomingMovies(page: number = 1) {
    try {
      const movies = await getUpcomingMovies(page);
      if (!movies) {
        throw new CustomError('Upcoming movies not found', 404, 'UPCOMING_MOVIES_NOT_FOUND');
      }
      return movies;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error('Error in fetchUpcomingMovies service:', error);
      throw new CustomError('Failed to fetch upcoming movies', 500, 'TMDB_UPCOMING_MOVIES_ERROR');
    }
  }

  static async fetchMovieById(movieId: number) {
    try {
      const movie = await getMovieByID(movieId);
      if (!movie) {
        throw new CustomError('Movie not found', 404, 'MOVIE_NOT_FOUND');
      }
      return movie;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error('Error in fetchMovieById service:', error);
      throw new CustomError('Failed to fetch movie details', 500, 'TMDB_MOVIE_DETAILS_ERROR');
    }
  }

  static async fetchSimilarMovies(movieId: number) {
    try {
      const similarMovies = await getSimilarMovies(movieId);
      if (!similarMovies) {
        throw new CustomError('Similar movies not found', 404, 'SIMILAR_MOVIES_NOT_FOUND');
      }
      return similarMovies;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error('Error in fetchSimilarMovies service:', error);
      throw new CustomError('Failed to fetch similar movies', 500, 'TMDB_SIMILAR_MOVIES_ERROR');
    }
  }

  static async fetchMovieGenres() {
    try {
      const genres = await getMovieGenres();
      if (!genres) {
        throw new CustomError('Genres not found', 404, 'GENRES_NOT_FOUND');
      }
      return genres;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error('Error in fetchMovieGenres service:', error);
      throw new CustomError('Failed to fetch movie genres', 500, 'TMDB_GENRES_ERROR');
    }
  }

  static async searchMovies(query: string, page: number = 1) {
    try {
      if (!query || query.trim() === '') {
        throw new CustomError('Search query is required', 400, 'INVALID_SEARCH_QUERY');
      }
      const response = await searchMovie(query);
      return {
        results: response.results,
        page: response.page,
        total_pages: response.total_pages,
        total_results: response.total_results
      };
  
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error('Error in searchMovies service:', error);
      throw new CustomError('Failed to search movies', 500, 'TMDB_SEARCH_ERROR');
    }
  }
}