import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authenticateJwt';
import { WatchlistService } from '../services/watchlistService';
import { CustomError } from '../utils/customError';

interface UserPayload {
  id: string;
}

class WatchlistController {
  static async addToWatchlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { movieId, status } = req.body;
      const user = req.user as UserPayload;

      const watchlistItem = await WatchlistService.addToWatchlist(
        user.id,
        movieId,
        status
      );

      res.status(201).json(watchlistItem);
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      }
      return next(new CustomError('Failed to add movie to watchlist', 500));
    }
  }

  static async removeFromWatchlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { movieId } = req.params;
      const user = req.user as UserPayload;

      await WatchlistService.removeFromWatchlist(user.id, Number(movieId));
      res.status(204).send();
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      }
      return next(new CustomError('Failed to remove movie from watchlist', 500));
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { movieId } = req.params;
      const { status } = req.body;
      const user = req.user as UserPayload;

      const watchlistItem = await WatchlistService.updateWatchlistStatus(
        user.id,
        Number(movieId),
        status
      );

      res.json(watchlistItem);
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      }
      return next(new CustomError('Failed to update watchlist status', 500));
    }
  }

  static async getWatchlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user as UserPayload;
      const { status } = req.query;

      const watchlist = await WatchlistService.getUserWatchlist(
        user.id,
        status as 'planned' | 'watched' | 'watching'
      );

      res.json(watchlist);
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      }
      return next(new CustomError('Failed to get watchlist', 500));
    }
  }

  static async checkInWatchlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { movieId } = req.params;
      const user = req.user as UserPayload;

      if (isNaN(Number(movieId))) {
        return next(new CustomError('Invalid movie ID', 400, 'INVALID_MOVIE_ID'));
      }

      const isInWatchlist = await WatchlistService.isInWatchlist(
        user.id,
        Number(movieId)
      );

      res.json({ isInWatchlist });
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      }
      return next(new CustomError('Failed to check watchlist status', 500));
    }
  }
}

export default WatchlistController;