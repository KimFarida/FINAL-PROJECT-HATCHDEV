import { AppDataSource } from "../config/database";
import { Repository } from 'typeorm';
import { User } from "../entities/User";
import { Profile } from "../entities/UserProfile";
import { Movie } from "../entities/Movie";
import { getMovieGenres } from "../utils/tmdbApiClient";
import { CustomError } from "../utils/customError";
import { In } from "typeorm";
import { Genre } from "../types/movie";


type WatchTime = 'morning' | 'afternoon' | 'evening' | 'night';
type Mood = 'happy' | 'relaxed' | 'excited' | 'thoughtful'; 

interface PreferenceResponse {
  basics: {
    watchTime: WatchTime | '';
    moods: Mood[];
  };
  genres: {
    favorites: number[];
    available: Genre[];
    suggested: number[];
  };
}

interface PreferenceUpdates {
  watchTime?: WatchTime;
  favoriteGenres?: number[];
  moods?: Mood[];
}

export class UserPreferenceService {
  private profileRepository: Repository<Profile>;
  private userRepository: Repository<User>;
  private movieRepository: Repository<Movie>;
  private readonly popularGenreIds = [28, 12, 35, 18, 10751];
  private readonly validWatchTimes: WatchTime[] = ['morning', 'afternoon', 'evening', 'night'];

  constructor() {
    this.profileRepository = AppDataSource.getRepository(Profile);
    this.userRepository = AppDataSource.getRepository(User);
    this.movieRepository = AppDataSource.getRepository(Movie);
  }

  private async getProfileByUserId(userId: string): Promise<Profile> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile']
    });

    if (!user || !user.profile) {
      throw new CustomError('User or profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    return user.profile;
  }

  private validateWatchTime(watchTime: string): asserts watchTime is WatchTime {
    if (!this.validWatchTimes.includes(watchTime as WatchTime)) {
      throw new CustomError(
        'Invalid watch time. Must be morning, afternoon, evening, or night',
        400,
        'INVALID_WATCH_TIME'
      );
    }
  }

  private async validateGenres(genreIds: number[]): Promise<void> {
    const availableGenres = await getMovieGenres();
    const validGenreIds = availableGenres?.map(g => g.id) || [];
    
    const invalidGenres = genreIds.filter(id => !validGenreIds.includes(id));
    if (invalidGenres.length > 0) {
      throw new CustomError(
        `Invalid genre IDs: ${invalidGenres.join(', ')}`,
        400,
        'INVALID_GENRE_IDS'
      );
    }
  }

  async getAllPreferences(userId: string): Promise<PreferenceResponse> {
    try {
      const profile = await this.getProfileByUserId(userId);
      const availableGenres = await getMovieGenres();

      if (!availableGenres) {
        throw new CustomError('Failed to fetch genres', 500, 'GENRE_FETCH_ERROR');
      }

      const currentFavorites = profile.preferences?.favoriteGenres || [];
      const suggestedGenres = await this.getSuggestedGenres(userId, currentFavorites);

      return {
        basics: {
          watchTime: (profile.preferences?.watchTime as WatchTime) || '',
          moods: (profile.preferences?.moods as Mood[]) || []
        },
        genres: {
          favorites: currentFavorites,
          available: availableGenres,
          suggested: suggestedGenres
        }
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to fetch preferences', 500, 'PREFERENCE_FETCH_ERROR');
    }
  }

  async updatePreferences(userId: string, updates: PreferenceUpdates): Promise<PreferenceResponse> {
    try {
      // Validate updates
      if (updates.watchTime) {
        this.validateWatchTime(updates.watchTime);
      }

      if (updates.favoriteGenres?.length) {
        await this.validateGenres(updates.favoriteGenres);
      }

      const profile = await this.getProfileByUserId(userId);

      profile.preferences = {
        ...profile.preferences,
        ...updates
      };

      await this.profileRepository.save(profile);
      return this.getAllPreferences(userId);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update preferences', 500, 'PREFERENCE_UPDATE_ERROR');
    }
  }

  private async getSuggestedGenres(userId: string, currentFavorites: number[]): Promise<number[]> {
    // Combine watch history suggestions with popular genres
    const watchHistorySuggestions = await this.suggestGenresFromWatchHistory(userId);
    const popularSuggestions = this.popularGenreIds.filter(
      id => !currentFavorites.includes(id)
    );

    // Combine and deduplicate suggestions
    return [...new Set([...watchHistorySuggestions, ...popularSuggestions])]
      .filter(id => !currentFavorites.includes(id))
      .slice(0, 5);
  }

  private async suggestGenresFromWatchHistory(userId: string): Promise<number[]> {
    try {
      const profile = await this.getProfileByUserId(userId);

      if (!profile.watchedMovies?.length) {
        return [];
      }

      const watchedMovies = await this.movieRepository.findBy({
        id: In(profile.watchedMovies)
      });

      const genreCounts = new Map<number, number>();
      
      watchedMovies.forEach(movie => {
        movie.genre_ids?.forEach(genreId => {
          genreCounts.set(genreId, (genreCounts.get(genreId) || 0) + 1);
        });
      });

      return Array.from(genreCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([genreId]) => genreId);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to suggest genres', 500, 'SUGGEST_GENRES_ERROR');
    }
  }
}