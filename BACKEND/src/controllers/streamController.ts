import { Request, Response, NextFunction } from 'express';
import { PlayerService } from '../services/streamService';
import { CustomError } from '../utils/customError';

export class PlayerController {
  static async getPlayer(req: Request, res: Response, next: NextFunction) {
    try {
      const { video_id, tmdb = 0, season = 0, episode = 0 } = req.query;

      if (!video_id) {
        return next(new CustomError('video_id is required', 400, 'MISSING_VIDEO_ID'));
      }

      const playerUrl = await PlayerService.fetchPlayerUrl({
        video_id: video_id as string,
        tmdb: Number(tmdb),
        season: Number(season),
        episode: Number(episode),
      });

      res.json({ url: playerUrl });
    } catch (error) {
      if (error instanceof CustomError) {
        return next(error);
      }
      return next(new CustomError('Internal Server Error', 500));
    }
  }
}
