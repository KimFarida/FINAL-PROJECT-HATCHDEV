import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { Movie } from '../types/interfaces';
import { userService } from '../api/user';
import MovieItem from './MovieItem';

interface RecentlyWatchedSectionProps {
  onError?: (error: string) => void;
}

const RecentlyWatchedSection: React.FC<RecentlyWatchedSectionProps> = ({ onError }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentlyWatched = async () => {
      try {
        setLoading(true);
        const watchedMovies = await userService.getRecentlyWatched();
        setMovies(watchedMovies);
      } catch (err) {
        console.error('Error fetching recently watched:', err);
        onError?.('Failed to load recently watched movies');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyWatched();
  }, [onError]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="spinner-border animate-spin h-8 w-8 border-t-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Recently Watched</h2>
        <div className="text-sm text-gray-400">
          Total Watched: {movies.length}
        </div>
      </div>

      {movies.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Play className="mx-auto mb-4 opacity-50" size={48} />
          <p className="text-gray-400">No movies watched yet</p>
          <p className="text-sm text-gray-500 mt-2">Start watching to build your history!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {movies.map((movie) => (
            <MovieItem key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentlyWatchedSection