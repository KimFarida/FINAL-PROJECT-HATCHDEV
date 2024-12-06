import { useState, useEffect, useCallback } from 'react';
import { watchlistService } from '../api/watchlist';

interface UseWatchlistProps {
  movieId: number;
}

interface UseWatchlistReturn {
  isInWatchlist: boolean;
  isLoading: boolean;
  toggleWatchlist: () => Promise<void>;
}

export const useWatchlist = ({ movieId }: UseWatchlistProps): UseWatchlistReturn => {
  const [isInWatchlist, setIsInWatchlist] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check watchlist status whenever movieId changes
  useEffect(() => {
    const checkStatus = async () => {
      if (!movieId) return;
      
      try {
        const status = await watchlistService.isInWatchlist(movieId);
        setIsInWatchlist(status);
      } catch (error) {
        console.error('Error checking watchlist status:', error);
      }
    };

    checkStatus();
  }, [movieId]);

  const toggleWatchlist = useCallback(async () => {
    if (!movieId || isLoading) return;
    
    setIsLoading(true);
    try {
      if (isInWatchlist) {
        await watchlistService.removeFromWatchlist(movieId);
        setIsInWatchlist(false);
      } else {
        await watchlistService.addToWatchlist(movieId);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [movieId, isInWatchlist, isLoading]);

  return {
    isInWatchlist,
    isLoading,
    toggleWatchlist
  };
};