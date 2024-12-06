export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    profile: Profile;
};

export interface Profile {
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