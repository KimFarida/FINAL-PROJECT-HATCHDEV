export interface User{
    id: string;
    username: string
    email: string
    profile: UserProfile
    avatar?: string; 
    createdAt?: string;
}

export interface UserProfile {
  currentStreak: number;
  longestStreak: number;
  lastWatchDate?: Date | null;
  streakResetDate?: Date | null;
  watchedMovies: number[];
  preferences: {
      favoriteGenres: number[];
      watchTime: string;
      moods?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Movie{
    id: number;
    title: string;
    genres?: Genre[];
    genre_ids?: number[]
    overview?: string;
    vote_average: number;
    runtime?: number;
    poster_path: string;
    backdrop_path?: string;
    release_date: string;
    original_language: string;
    popularity?: number
}

  export interface Reminder{
    id: string;
    movieId: string;
    reminderTime: string;
    message?: string;
  }

  // Auth Interfaces
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface SignupCredentials extends LoginCredentials {
    username: string;
  }

  export interface AuthResponse {
    user: User;
    accessToken: string; // JWT token
  }
  
  export interface Genre {
    id: number; 
    name: string; // Genre name (e.g., "Action", "Drama")
  }
  
  export interface Mood {
    id: string; // Mood ID (e.g., "feel-good")
    name: string; // Mood name
    associatedGenres: number[]; // Array of genre IDs matching this mood
  }
  

  export interface MovieResponse {
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
  }
  
export interface GenreResponse {
    genres: Genre[];
  }


export interface WatchlistItem {
  id: string;
  movieId: number;
  status: 'planned' | 'watched' | 'watching';
  addedAt: Date;
  movie: Movie;
}

export interface WatchlistResponse {
  items: WatchlistItem[];

}

export interface StreamParams {
  video_id: string;
  tmdb?: number;
  season?: number;
  episode?: number;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  lastWatchDate: Date | null;
}

export type WatchTime = 'morning' | 'afternoon' | 'evening' | 'night';

export interface PreferenceResponse {
  basics: {
    watchTime: WatchTime | '';
    moods: string[]; 
  };
  genres: {
    favorites: number[];
    available: {
      id: number;
      name: string;
    }[];
    suggested: number[];
  };
}

export interface PreferenceUpdates {
  watchTime?: WatchTime;
  favoriteGenres?: number[];
  moods?: string[];
}

export interface MovieRecommendation extends Movie {
  matchScore: number;
  reasons: string[];
}