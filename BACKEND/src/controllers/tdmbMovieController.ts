import { Request, Response, NextFunction } from "express";
import { TMDBMovieService } from "../services/tdmbMovieService";
import { CustomError } from '../utils/customError';

class TMDBMovieController {
  static async discoverMovies(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const response = await TMDBMovieService.fetchDiscoverMovies(page);
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      }
      return next(new CustomError('Failed to discover movies', 500));
    }
  }

  static async getNowPlayingMovies(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const response = await TMDBMovieService.fetchNowPlayingMovies(page);
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      }
      return next(new CustomError('Failed to get now playing movies', 500));
    }
  }

  static async getPopularMovies(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const response = await TMDBMovieService.fetchPopularMovies(page);
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      }
      return next(new CustomError('Failed to get popular movies', 500));
    }
  }

  static async getTopRatedMovies(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const response = await TMDBMovieService.fetchTopRatedMovies(page);
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      }
      return next(new CustomError('Failed to get top rated movies', 500));
    }
  }

  static async getUpcomingMovies(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const response = await TMDBMovieService.fetchUpcomingMovies(page);
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      }
      return next(new CustomError('Failed to get upcoming movies', 500));
    }
  }

  static async getMovieById(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId = parseInt(req.params.id, 10);
      
      if (isNaN(movieId)) {
        return next(new CustomError('Invalid movie ID', 400, 'INVALID_MOVIE_ID'));
      }
      
      const movie = await TMDBMovieService.fetchMovieById(movieId);
      res.status(200).json(movie);
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      }
      return next(new CustomError('Failed to get movie details', 500));
    }
  }

  static async getSimilarMovies(req: Request, res: Response, next: NextFunction) {
    try {
      const movieId = parseInt(req.params.id, 10);
      const page = parseInt(req.query.page as string, 10) || 1;
      
      if (isNaN(movieId)) {
        return next(new CustomError('Invalid movie ID', 400, 'INVALID_MOVIE_ID'));
      }
      
      const similarMovies = await TMDBMovieService.fetchSimilarMovies(movieId);
      res.status(200).json(similarMovies);
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      }
      return next(new CustomError('Failed to get similar movies', 500));
    }
  }

  static async getMovieGenres(req: Request, res: Response, next: NextFunction) {
    try {
      const genres = await TMDBMovieService.fetchMovieGenres();
      res.status(200).json(genres);
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      }
      return next(new CustomError('Failed to get movie genres', 500));
    }
  }

  static async searchMovies(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.query;
      const page = parseInt(req.query.page as string, 10) || 1;
      
      if (!query || typeof query !== 'string') {
        return next(new CustomError('Search query is required', 400, 'INVALID_SEARCH_QUERY'));
      }
      
      const response = await TMDBMovieService.searchMovies(query, page);
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      }
      return next(new CustomError('Failed to search movies', 500));
    }
  }
}

export default TMDBMovieController;