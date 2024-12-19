import { Request, Response, NextFunction } from 'express';
import { RecommendationService } from '../services/recommendationService';
import { CustomError } from '../utils/customError';

class RecommendationController {
  private static recommendationService = new RecommendationService();

  static async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { mood } = req.query;

      if (!userId) {
        return next(new CustomError('User ID is missing in the token', 400));
      }

      const recommendations = await RecommendationController.recommendationService
        .getRecommendations(userId, mood as string);

      res.json(recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return next(error instanceof CustomError 
        ? error 
        : new CustomError('Failed to get recommendations', 500));
    }
  }
}

export default RecommendationController;
