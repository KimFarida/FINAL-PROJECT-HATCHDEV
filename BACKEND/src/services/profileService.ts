import { AppDataSource } from '../config/database';
import { Profile } from '../entities/UserProfile';
import { Movie } from '../entities/Movie';
import { User } from '../entities/User'
import { CustomError } from '../utils/customError';
import { TMDBMovieService } from './tdmbMovieService';


interface UserProfile {
    username:string
    email: string
    profile : Profile
}

type WatchTime = 'morning' | 'afternoon' | 'evening' | 'night';

export class ProfileService {
    private profileRepository = AppDataSource.getRepository(Profile);
    private movieRepository = AppDataSource.getRepository(Movie);
    private userRepository  = AppDataSource.getRepository(User);

    async getProfile(userId: string): Promise<UserProfile> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['profile']
            });
    
            if (!user) {
                throw new CustomError('User not found', 404);
            }
    
            return {
                username: user.username,
                email: user.email,
                profile: user.profile
            };
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error instanceof CustomError 
                ? error 
                : new CustomError('Server error while fetching profile', 500);
        }
    }

    async addToRecentlyWatched(userId: string, movieId: number): Promise<Profile> {
        const profile = await this.profileRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user']
        });

        if (!profile) {
            throw new CustomError('Profile not found', 404);
        }

        try {

            // Check if movie exists in our DB
            let movie = await this.movieRepository.findOne({
                where: { id: movieId }
            });

            if (!movie) {
                const tmdbMovie = await TMDBMovieService.fetchMovieById(movieId);
                movie = await this.movieRepository.save(tmdbMovie);
            }
    

            // Initialize array if it doesn't exist
            if (!profile.watchedMovies) {
                profile.watchedMovies = [];
            }

            // Remove the movieId if it already exists (to avoid duplicates)
            profile.watchedMovies = profile.watchedMovies.filter(id => id !== movieId);

            // Add to the beginning of the array (most recent first)
            profile.watchedMovies.unshift(movieId);

            // Keep only the last 10 movies (or whatever limit you want)
            profile.watchedMovies = profile.watchedMovies.slice(0, 10);

            return await this.profileRepository.save(profile);
        } catch (error) {
            console.error('Error updating recently watched:', error);
            throw new CustomError('Failed to update recently watched movies', 500);
        }
    }

    async getRecentlyWatched(userId: string): Promise<Movie[]> {
        try {
            // Get profile with watched movie IDs
            const profile = await this.profileRepository.findOne({
                where: { user: { id: userId } },
                relations: ['user']
            });

            if (!profile) {
                throw new CustomError('Profile not found', 404);
            }

            if (!profile.watchedMovies?.length) {
                return [];
            }

            // Fetch movie details for each ID
            const movies = await this.movieRepository
                .createQueryBuilder('movie')
                .where('movie.id IN (:...ids)', { ids: profile.watchedMovies })
                // Maintain the order of watchedMovies array
                .orderBy(`ARRAY_POSITION(:ids::int[], movie.id::int)`)
                .setParameter('ids', profile.watchedMovies)
                .getMany();

            return movies;
        } catch (error) {
            console.error('Error fetching recently watched movies:', error);
            throw new CustomError('Failed to fetch recently watched movies', 500);
        }
    }

    async updateWatchTime(userId: string, watchTime: WatchTime): Promise<Profile> {
        try {
          // Validate watch time
          const validWatchTimes: WatchTime[] = ['morning', 'afternoon', 'evening', 'night'];
          if (!validWatchTimes.includes(watchTime)) {
            throw new CustomError(
              'Invalid watch time. Must be morning, afternoon, evening, or night',
              400,
              'INVALID_WATCH_TIME'
            );
          }
    
          const user = await this.getProfile(userId);
          const profile = user.profile

          profile.preferences = {
            ...profile.preferences,
            watchTime
          };
    
          const profileRepository = AppDataSource.getRepository(Profile);
          return await profileRepository.save(profile);
        } catch (error) {
          if (error instanceof CustomError) {
            throw error;
          }
          throw new CustomError('Failed to update watch time', 500, 'UPDATE_WATCH_TIME_ERROR');
        }
      }

}