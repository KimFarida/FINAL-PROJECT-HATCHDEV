import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Profile } from '../entities/UserProfile';
import { CustomError } from '../utils/customError';
import { TMDBMovieService } from './tdmbMovieService';
import { Movie as TMDBMovie } from '../types/movie';
import { moodFilters } from '../utils/moodUtils';
import { Not, IsNull } from 'typeorm';

interface MovieRecommendation {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  original_language?:string
  release_date?: string ;
  vote_average: number;
  popularity: number;
  genre_ids: number[];
  matchScore: number;
  reasons: string[];
}

export class RecommendationService {
  private userRepository = AppDataSource.getRepository(User);
  private profileRepository = AppDataSource.getRepository(Profile);

  async getRecommendations(userId: string, mood?: string): Promise<MovieRecommendation[]> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['profile']
      });

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      if (user.profile.watchedMovies?.length) {
        return this.getEnhancedRecommendations(user, mood);
      }

      return this.getGenreBasedRecommendations(user, mood);
    } catch (error) {
      throw error instanceof CustomError 
        ? error 
        : new CustomError('Failed to get recommendations', 500);
    }
  }

  private async getEnhancedRecommendations(user: User, mood?: string): Promise<MovieRecommendation[]> {
    try {
      const similarUsers = await this.findSimilarUsers(
        user.id,
        user.profile.watchedMovies,
        user.profile.preferences.favoriteGenres
      );

      const [collaborativeMovies, genreRecs, moodRecs] = await Promise.all([
        this.getRecommendationsFromSimilarUsers(user.profile.watchedMovies, similarUsers),
        this.getGenreBasedRecommendations(user),
        mood ? this.getMoodBasedRecommendations(mood) : Promise.resolve([])
      ]);

      return this.combineAndScoreRecommendations(genreRecs, collaborativeMovies, moodRecs, mood);
    } catch (error) {
      throw error instanceof CustomError 
        ? error 
        : new CustomError('Failed to get enhanced recommendations', 500);
    }
  }

  private async getGenreBasedRecommendations(user: User, mood?: string): Promise<MovieRecommendation[]> {
    try {
      const favoriteGenres = user.profile.preferences.favoriteGenres;
      if (!favoriteGenres?.length) {
        throw new CustomError('No favorite genres found', 404);
      }

      const response = await TMDBMovieService.fetchDiscoverMovies(1, {
        with_genres: favoriteGenres.join('|'),
        sort_by: 'popularity.desc'
      });

      const movies : MovieRecommendation[] = response.results
      const unwatchedMovies = movies.filter(movie => 
        !user.profile.watchedMovies.includes(Number(movie.id))
      );

      return unwatchedMovies.map(movie => ({
        id: Number(movie.id),
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        //release_date: movie.release_date,
        vote_average: Number(movie.vote_average) || 0,
        popularity: Number(movie.popularity) || 0,
        genre_ids: movie.genre_ids?.map(Number) || [],
        matchScore: this.calculateGenreMatchScore(movie.genre_ids?.map(Number) || [], favoriteGenres) * 100,
        reasons: ['Based on your favorite genres']
      }));
    } catch (error) {
      throw error instanceof CustomError 
        ? error 
        : new CustomError('Failed to get genre recommendations', 500);
    }
  }

  private async getMoodBasedRecommendations(mood: string): Promise<TMDBMovie[]> {
    if (!moodFilters[mood]) {
        throw new CustomError('Invalid mood', 400);
      }
    
      const response = await TMDBMovieService.fetchDiscoverMovies(1, {
        ...moodFilters[mood],
        include_adult: false,
        language: 'en-US'
      });
    
      const movies: TMDBMovie[] = response.results
      return movies.filter(movie => 
        movie.poster_path && 
        movie.backdrop_path //&&
        //movie.overview.length > 100 
      );
  }

  private async findSimilarUsers(
    userId: string,
    userWatchHistory: number[],
    userFavoriteGenres: number[]
  ): Promise<Profile[]> {
    const profiles = await this.profileRepository.find({
      where: {
        user: { id: Not(userId) },
        watchedMovies: Not(IsNull())
      }
    });

    const scoredProfiles = profiles.map(profile => ({
      profile,
      similarityScore: this.calculateUserSimilarity(
        userWatchHistory,
        userFavoriteGenres,
        profile.watchedMovies,
        profile.preferences.favoriteGenres
      )
    }));

    return scoredProfiles
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 5)
      .map(scored => scored.profile);
  }

  private calculateUserSimilarity(
    watchHistory1: number[],
    genres1: number[],
    watchHistory2: number[],
    genres2: number[]
  ): number {
    const watchHistoryOverlap = this.calculateWatchHistoryOverlap(watchHistory1, watchHistory2);
    const genreSimilarity = this.calculateGenreSimilarity(genres1, genres2);
    return (watchHistoryOverlap * 0.7) + (genreSimilarity * 0.3);
  }

  private calculateWatchHistoryOverlap(history1: number[], history2: number[]): number {
    const overlap = history1.filter(id => history2.includes(id)).length;
    return overlap / Math.max(history1.length, history2.length);
  }

  private calculateGenreSimilarity(genres1: number[], genres2: number[]): number {
    const intersection = genres1.filter(g => genres2.includes(g)).length;
    return intersection / Math.max(genres1.length, genres2.length);
  }

  private calculateGenreMatchScore(movieGenres: number[], userGenres: number[]): number {
    const matchingGenres = movieGenres.filter(genre => userGenres.includes(genre)).length;
    return matchingGenres / Math.max(movieGenres.length, 1);
  }

  private async getRecommendationsFromSimilarUsers(
    userWatchHistory: number[],
    similarUsers: Profile[]
  ): Promise<any[]> {
    const movieFrequency = new Map<number, number>();

    similarUsers.forEach(user => {
      user.watchedMovies.forEach(movieId => {
        if (!userWatchHistory.includes(movieId)) {
          movieFrequency.set(movieId, (movieFrequency.get(movieId) || 0) + 1);
        }
      });
    });

    const recommendedMovieIds = Array.from(movieFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([movieId]) => movieId);

    const movieDetails = await Promise.all(
      recommendedMovieIds.map(id => TMDBMovieService.fetchMovieById(id))
    );

    return movieDetails.filter(movie => movie !== null);
  }

  private combineAndScoreRecommendations(
    genreRecs: MovieRecommendation[],
    collaborativeRecs: TMDBMovie[],
    moodRecs: TMDBMovie[],
    mood?: string
  ): MovieRecommendation[] {
    const allMovies = new Map<number, MovieRecommendation>();

    genreRecs.forEach(movie => {
      allMovies.set(movie.id, {
        ...movie,
        matchScore: movie.matchScore * 0.35,
        reasons: ['Matches your favorite genres']
      });
    });

    collaborativeRecs.forEach(movie => {
      const movieId = Number(movie.id);
      const existing = allMovies.get(movieId);
      if (existing) {
        existing.matchScore += 40;
        existing.reasons.push('Recommended based on similar users');
      } else {
        allMovies.set(movieId, this.convertToRecommendation(movie, 40, ['Recommended based on similar users']));
      }
    });

    if (mood) {
      moodRecs.forEach(movie => {
        const movieId = Number(movie.id);
        const existing = allMovies.get(movieId);
        if (existing) {
          existing.matchScore += 25;
          existing.reasons.push(`Matches your ${mood.toLowerCase()} mood`);
        } else {
          allMovies.set(movieId, this.convertToRecommendation(movie, 25, [`Matches your ${mood.toLowerCase()} mood`]));
        }
      });
    }

    return Array.from(allMovies.values())
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }

  private convertToRecommendation(
    movie: TMDBMovie, 
    initialScore: number, 
    reasons: string[]
  ): MovieRecommendation {
    return {
      id: Number(movie.id),
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      vote_average: Number(movie.vote_average) || 0,
      popularity: Number(movie.popularity) || 0,
      genre_ids: movie.genre_ids?.map(Number) || [],
      matchScore: initialScore,
      reasons: reasons
    };
  }
}