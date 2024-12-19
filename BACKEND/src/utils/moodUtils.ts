interface AdvancedMoodFilter {
    with_genres: string;
    vote_average_gte: number;
    vote_count_gte: number;
    sort_by: string;
    include_adult: boolean;
    with_runtime?: { gte?: number; lte?: number };
    without_genres?: string; 
    release_date?: { gte?: string; lte?: string };
    with_original_language?: string;
    with_keywords?: string;
  }
  
export const moodFilters: Record<string, AdvancedMoodFilter> = {
    'Feel Good': {
      with_genres: '35,10751', // Comedy, Family
      vote_average_gte: 7.0,
      vote_count_gte: 1000,
      sort_by: 'vote_average.desc',
      include_adult: false,
      without_genres: '27,53', // Exclude Horror and Thriller
      with_runtime: { gte: 85, lte: 150 }, // Not too short, not too long
      with_keywords: '9715|31629', // 'feel-good|uplifting'
    },
  
    'Adventurous': {
      with_genres: '12|28|14', // Adventure OR Action OR Fantasy (using OR for more variety)
      vote_average_gte: 6.5,
      vote_count_gte: 1500,
      sort_by: 'popularity.desc',
      include_adult: false,
      with_runtime: { gte: 100 }, // Epic adventures tend to be longer
      with_keywords: '1365|12554|155|1701', // 'adventure|quest|journey|expedition'
    },
  
    'Romantic': {
      with_genres: '10749',
      vote_average_gte: 6.8,
      vote_count_gte: 800,
      sort_by: 'vote_average.desc',
      include_adult: false,
      without_genres: '27,53', // Exclude Horror and Thriller
      with_runtime: { gte: 90, lte: 150 },
      release_date: { gte: '2000-01-01' }, // More modern romances
    },
  
    'Thriller': {
      with_genres: '53|9648|27', // Thriller OR Mystery OR Horror
      vote_average_gte: 6.5,
      vote_count_gte: 1000,
      sort_by: 'vote_count.desc', // Well-received thrillers
      include_adult: false,
      with_runtime: { gte: 90 },
      with_keywords: '10349|15029', // 'suspense|twist'
    },
  
    'Emotional': {
      with_genres: '18',
      vote_average_gte: 7.5,
      vote_count_gte: 1000,
      sort_by: 'vote_average.desc',
      include_adult: false,
      with_runtime: { gte: 100 },
      with_keywords: '177|155|15083', // 'emotional|drama|tear-jerker'
    }
  };
  
  // Convert our filter to TMDB params
export const convertFilterToParams = (filter: AdvancedMoodFilter) => ({
    with_genres: filter.with_genres,
    vote_average_gte: filter.vote_average_gte,
    vote_count_gte: filter.vote_count_gte,
    sort_by: filter.sort_by,
    include_adult: filter.include_adult,
    'with_runtime.gte': filter.with_runtime?.gte,
    'with_runtime.lte': filter.with_runtime?.lte,
    without_genres: filter.without_genres,
    'release_date.gte': filter.release_date?.gte,
    'release_date.lte': filter.release_date?.lte,
    with_original_language: filter.with_original_language,
    with_keywords: filter.with_keywords
  });
  
