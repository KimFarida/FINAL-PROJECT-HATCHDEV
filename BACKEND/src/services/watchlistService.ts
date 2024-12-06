// services/watchlistService.ts
import { AppDataSource } from '../config/database';
import { WatchlistItem } from '../entities/WatchlistItem';
import { User } from '../entities/User';
import { Movie } from '../entities/Movie';
import { TMDBMovieService } from '../services/tdmbMovieService';
import { CustomError } from '../utils/customError';

export class WatchlistService {
    static async addToWatchlist(
        userId: string, 
        movieId: number, 
        status: 'planned' | 'watched' | 'watching' = 'planned'
      ): Promise<WatchlistItem> {
        const watchlistRepository = AppDataSource.getRepository(WatchlistItem);
        const movieRepository = AppDataSource.getRepository(Movie);
        const userRepository = AppDataSource.getRepository(User);
    
        // Check if movie exists in our DB first
        let movie = await movieRepository.findOne({ where: { id: movieId }});
        
        // If not, fetch and save movie with genre_ids
        if (!movie) {
          const movieData = await TMDBMovieService.fetchMovieById(movieId);
          movie = movieRepository.create({
            id: movieData.id,
            title: movieData.title,
            overview: movieData.overview,
            vote_average: movieData.vote_average,
            runtime: movieData.runtime,
            poster_path: movieData.poster_path,
            backdrop_path: movieData.backdrop_path,
            release_date: movieData.release_date,
            original_language: movieData.original_language,
            popularity: movieData.popularity,
            genre_ids: movieData.genre_ids // Simply store the array of IDs
          });
          
          await movieRepository.save(movie);
        }
    
        // Check if movie is already in user's watchlist
        const existingItem = await watchlistRepository.findOne({
          where: {
            user: { id: userId },
            movie: { id: movieId }
          },
          relations: ['movie', 'user']
        });
    
        if (existingItem) {
          throw new CustomError('Movie already in watchlist', 400, 'MOVIE_ALREADY_IN_WATCHLIST');
        }
    
        const user = await userRepository.findOne({ where: { id: userId }});
        if (!user) {
          throw new CustomError('User not found', 404, 'USER_NOT_FOUND');
        }
    
        // Create watchlist item
        const watchlistItem = watchlistRepository.create({
          movie,
          user,
          status
        });
    
        return watchlistRepository.save(watchlistItem);
      }

  static async removeFromWatchlist(userId: string, movieId: number): Promise<void> {
    const watchlistRepository = AppDataSource.getRepository(WatchlistItem);

    const watchlistItem = await watchlistRepository.findOne({
      where: {
        user: { id: userId },
        movie: { id: movieId }
      }
    });

    if (!watchlistItem) {
      throw new CustomError('Movie not found in watchlist', 404, 'MOVIE_NOT_IN_WATCHLIST');
    }

    await watchlistRepository.remove(watchlistItem);
  }

  static async updateWatchlistStatus(
    userId: string, 
    movieId: number, 
    status: 'planned' | 'watched' | 'watching'
  ): Promise<WatchlistItem> {
    const watchlistRepository = AppDataSource.getRepository(WatchlistItem);

    const watchlistItem = await watchlistRepository.findOne({
      where: {
        user: { id: userId },
        movie: { id: movieId }
      },
      relations: ['movie', 'user']
    });

    if (!watchlistItem) {
      throw new CustomError('Movie not found in watchlist', 404, 'MOVIE_NOT_IN_WATCHLIST');
    }

    watchlistItem.status = status;
    return watchlistRepository.save(watchlistItem);
  }

  static async getUserWatchlist(
    userId: string,
    status?: 'planned' | 'watched' | 'watching'
  ): Promise<WatchlistItem[]> {
    const watchlistRepository = AppDataSource.getRepository(WatchlistItem);

    const query: any = {
      where: {
        user: { id: userId }
      },
      relations: ['movie'],
      order: {
        addedAt: 'DESC'
      }
    };

    if (status) {
      query.where.status = status;
    }

    return watchlistRepository.find(query);
  }

  static async isInWatchlist(userId: string, movieId: number): Promise<boolean> {
    const watchlistRepository = AppDataSource.getRepository(WatchlistItem);

    const count = await watchlistRepository.count({
      where: {
        user: { id: userId },
        movie: { id: movieId }
      }
    });

    return count > 0;
  }
}