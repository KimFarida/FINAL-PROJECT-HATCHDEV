import { Router } from 'express';
import ProfileController from '../controllers/userProfileController';
import RecommendationController from '../controllers/recommendationController';
import authenticateJWT from '../middlewares/authenticateJwt';

const userRoutes = Router();
userRoutes.use(authenticateJWT)

// Profile and stats
userRoutes.get('/profile', ProfileController.getProfile);
userRoutes.get('/streak', ProfileController.getStreakStats);
userRoutes.post('/streak', ProfileController.recordWatch);

// Watch history
userRoutes.get('/recently-watched', ProfileController.getRecentlyWatched);
userRoutes.post('/recently-watched', ProfileController.addToRecentlyWatched);

// Profile Preferences
userRoutes.get('/preferences', ProfileController.getAllPreferences);
userRoutes.put('/preferences', ProfileController.updatePreferences);

// Movie Reccomedations bases on User
userRoutes.get('/recommendations', RecommendationController.getRecommendations)

export default userRoutes;

