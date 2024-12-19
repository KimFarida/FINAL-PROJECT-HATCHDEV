import { Request, Response, NextFunction } from 'express';
import { StreakService } from '../services/streakService';
import { ProfileService } from '../services/profileService';
import { UserPreferenceService } from '../services/profilePreferenceService';
import { CustomError } from '../utils/customError';

class ProfileController {
    private static streakService = new StreakService();
    private static profileService = new ProfileService();
    private static preferenceService = new UserPreferenceService();

    
    static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.id;
    
            if (!userId) {
                return next(new CustomError('User ID is missing in the token', 400));
            }
    
            const user = await ProfileController.profileService.getProfile(userId);
            res.json(user);
        } catch (error) {
            console.error('Error fetching profile:', error);
            return next(error instanceof CustomError ? error : new CustomError('Server error while fetching profile', 500));
        }
    }

    static async getStreakStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                return next(new CustomError('User ID is missing in the token', 400));
            }

            const stats = await ProfileController.streakService.getStreakStats(userId);
            res.json(stats);
        } catch (error) {
            console.error('Error fetching streak stats:', error);
            return next(error instanceof CustomError ? error : new CustomError('Server error while fetching streak stats', 500));
        }
    }

    static async recordWatch(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                return next(new CustomError('User ID is missing in the token', 400));
            }

            const updatedProfile = await ProfileController.streakService.updateStreak(userId);
            res.json({
                currentStreak: updatedProfile.currentStreak,
                longestStreak: updatedProfile.longestStreak,
                lastWatchDate: updatedProfile.lastWatchDate
            });
        } catch (error) {
            console.error('Error updating streak:', error);
            return next(error instanceof CustomError ? error : new CustomError('Server error while updating streak', 500));
        }
    }

    static async addToRecentlyWatched(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const { movieId } = req.body;

            if (!userId) {
                return next(new CustomError('User ID is missing in the token', 400));
            }

            if (!movieId || typeof movieId !== 'number') {
                return next(new CustomError('Valid movie ID is required', 400));
            }

            const updatedProfile = await ProfileController.profileService.addToRecentlyWatched(userId, movieId);
            res.json({
                watchedMovies: updatedProfile.watchedMovies
            });
        } catch (error) {
            console.error('Error adding to recently watched:', error);
            return next(error instanceof CustomError ? error : new CustomError('Failed to update recently watched movies', 500));
        }
    }

    static async getRecentlyWatched(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.id;
    
            if (!userId) {
                return next(new CustomError('User ID is missing in the token', 400));
            }
    
            const movies = await ProfileController.profileService.getRecentlyWatched(userId);
            res.json(movies);
        } catch (error) {
            console.error('Error getting recently watched movies:', error);
            return next(error instanceof CustomError ? error : new CustomError('Failed to fetch recently watched movies', 500));
        }
    }

    static async getAllPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                return next(new CustomError('User ID is missing in the token', 400));
            }

            const preferences = await ProfileController.preferenceService.getAllPreferences(userId);
            res.json(preferences);
        } catch (error) {
            console.error('Error fetching preferences:', error);
            return next(error instanceof CustomError ? error : new CustomError('Failed to fetch preferences', 500));
        }
    }

    static async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const updates = req.body;

            if (!userId) {
                return next(new CustomError('User ID is missing in the token', 400));
            }

            if (typeof updates !== 'object' || updates === null) {
                return next(new CustomError('Invalid updates format', 400));
            }

            const validUpdateFields = ['watchTime', 'favoriteGenres', 'moods'];
            const invalidFields = Object.keys(updates).filter(key => !validUpdateFields.includes(key));

            if (invalidFields.length > 0) {
                return next(new CustomError(`Invalid update fields: ${invalidFields.join(', ')}`, 400));
            }

            const updatedPreferences = await ProfileController.preferenceService.updatePreferences(userId, updates);
            res.json(updatedPreferences);
        } catch (error) {
            console.error('Error updating preferences:', error);
            return next(error instanceof CustomError ? error : new CustomError('Failed to update preferences', 500));
        }
    }
}

export default ProfileController;