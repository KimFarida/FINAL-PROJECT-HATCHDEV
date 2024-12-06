import { AppDataSource } from '../config/database';
import { Profile } from '../entities/UserProfile';
import { startOfDay, differenceInDays } from 'date-fns';
import { CustomError } from '../utils/customError';

export class StreakService {
    private profileRepository = AppDataSource.getRepository(Profile);

    private isStreakContinuous(lastWatchDate: Date): boolean {
        const today = startOfDay(new Date());
        const lastWatch = startOfDay(lastWatchDate);
        const daysDifference = differenceInDays(today, lastWatch);
        return daysDifference <= 1;
    }

    async updateStreak(userId: string): Promise<Profile> {
        const profile = await this.profileRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user']
        });

        if (!profile) {
            throw new CustomError('Profile not found for this user', 404);
        }

        const today = new Date();

        // If already watched today, don't update streak
        if (profile.lastWatchDate && 
            startOfDay(profile.lastWatchDate).getTime() === startOfDay(today).getTime()) {
            return profile;
        }

        try {
            // Check if streak continues or resets
            if (profile.lastWatchDate && this.isStreakContinuous(profile.lastWatchDate)) {
                // Increment streak if it's a new day
                if (differenceInDays(today, profile.lastWatchDate) === 1) {
                    profile.currentStreak += 1;
                }
            } else {
                // Reset streak if broken
                profile.currentStreak = 1;
            }

            // Update longest streak if current is higher
            if (profile.currentStreak > profile.longestStreak) {
                profile.longestStreak = profile.currentStreak;
            }

            profile.lastWatchDate = today;

            return await this.profileRepository.save(profile);
        } catch (error) {
            console.error('Error updating streak:', error);
            throw new CustomError('Failed to update streak', 500);
        }
    }

    async getStreakStats(userId: string) {
        const profile = await this.profileRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user']
        });

        if (!profile) {
            throw new CustomError('Profile not found for this user', 404);
        }

        try {
            // Check if streak is still valid
            if (profile.lastWatchDate && !this.isStreakContinuous(profile.lastWatchDate)) {
                profile.currentStreak = 0;
                await this.profileRepository.save(profile);
            }

            return {
                currentStreak: profile.currentStreak,
                longestStreak: profile.longestStreak,
                lastWatchDate: profile.lastWatchDate
            };
        } catch (error) {
            console.error('Error getting streak stats:', error);
            throw new CustomError('Failed to get streak stats', 500);
        }
    }
}