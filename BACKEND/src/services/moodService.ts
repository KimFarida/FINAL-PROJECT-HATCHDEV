import { AppDataSource } from '../config/database';
import { Mood } from '../entities/Mood';
import { Movie } from '../entities/Movie';
import { CustomError } from '../utils/customError';
import { discoverMovies } from '../utils/tmdbApiClient';

// Predefined mood mappings for initial setup
const DEFAULT_MOODS = [
  {
    name: 'Feel Good',
    genreIds: [35, 10751], // Comedy, Family
  },
  {
    name: 'Adventurous',
    genreIds: [12, 28, 14], // Adventure, Action, Fantasy
  },
  {
    name: 'Romantic',
    genreIds: [10749, 18], // Romance, Drama
  },
  {
    name: 'Thriller',
    genreIds: [53, 27, 9648], // Thriller, Horror, Mystery
  },
  {
    name: 'Emotional',
    genreIds: [18, 10749, 10752], // Drama, Romance, War
   
  }
];

export class MoodService {
  private moodRepository = AppDataSource.getRepository(Mood);

  async initializeDefaultMoods() {
    try {
      for (const mood of DEFAULT_MOODS) {
        const existingMood = await this.moodRepository.findOne({
          where: { name: mood.name }
        });

        if (!existingMood) {
          await this.moodRepository.save({
            name: mood.name,
            associatedGenres: mood.genreIds
          });
        }
      }
    } catch (error) {
      throw new CustomError('Failed to initialize moods', 500);
    }
  }

  async getMoodBasedRecommendations(moodName: string) {
    try {
      const mood = await this.moodRepository.findOne({
        where: { name: moodName }
      });

      if (!mood) {
        throw new CustomError('Mood not found', 404);
      }

      // Use TMDB API to get movies matching the mood's genres
      const movies = await discoverMovies({
        with_genres: mood.associatedGenres.join(','),
        sort_by: 'popularity.desc',
        page: 1
      });

      return movies.slice(0, 10); // Return top 10 movies
    } catch (error) {
      throw new CustomError('Failed to get mood-based recommendations', 500);
    }
  }

  async getAllMoods() {
    return this.moodRepository.find();
  }
}