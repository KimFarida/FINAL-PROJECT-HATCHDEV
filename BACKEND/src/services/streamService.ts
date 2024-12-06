import axios from 'axios';
import { CustomError } from '../utils/customError';
import dotenv from 'dotenv';

dotenv.config();

const STREAMING_BASEURL = process.env.STREAMING_BASEURL

const playerSettings = {
  player_font: 'Poppins',
  player_bg_color: '000000',
  player_font_color: 'ffffff',
  player_primary_color: '34cfeb',
  player_secondary_color: '6900e0',
  player_loader: 1,
  preferred_server: 0,
  player_sources_toggle_type: 2,
};

const buildQueryString = (params: Record<string, any>): string => {
  // Convert all values to strings before creating URLSearchParams
  const stringifiedParams = Object.entries({ ...playerSettings, ...params }).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value.toString(),
    }),
    {} as Record<string, string>
  );

  return new URLSearchParams(stringifiedParams).toString();
};

export class PlayerService {
  static async fetchPlayerUrl(params: {
    video_id: string;
    tmdb?: number;  
    season?: number;
    episode?: number;
  }): Promise<string> {
    if (!params.video_id) {
      throw new CustomError('video_id is required', 400, 'MISSING_VIDEO_ID');
    }

    const tmdbValue = params.tmdb || 1;

    const queryString = buildQueryString({
      ...params,
      tmdb: tmdbValue,
    });

    const apiUrl = `${STREAMING_BASEURL}/?${queryString}`;

    try {
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      throw new CustomError('Failed to fetch player URL', 500, 'FETCH_ERROR');
    }
  }
}
