import { streamService } from "../api/streamService";

interface PlayOptions {
  movieId: number;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: Error) => void;
}

export const playMovie = async ({ 
  movieId, 
  onPlayStart, 
  onPlayEnd, 
  onError 
}: PlayOptions): Promise<void> => {
  try {
    onPlayStart?.();
    const url = await streamService.getPlayerUrl({
      video_id: movieId.toString(),
    });
    
    // Open the URL in a new tab
    if (url) {
      window.open(url, '_blank');
    } else {
      throw new Error('No valid player URL received');
    }
    
    onPlayEnd?.();
  } catch (error) {
    console.error('Error loading player:', error);
    onError?.(error as Error);
  }
};