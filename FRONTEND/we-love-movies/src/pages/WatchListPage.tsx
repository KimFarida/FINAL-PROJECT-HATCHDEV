import React, { useState, useEffect } from 'react';
import { Trash2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WatchlistItem } from '../types/interfaces';
import { watchlistService } from '../api/watchlist';
import { getFullPosterUrl } from '../utilities/getPoster';
import { playMovie } from '../utilities/playUtils';
import NavBar from '../components/NavBar';


const WatchlistPage: React.FC = () => {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [activeStatus, setActiveStatus] = useState<'planned' | 'watched' | 'watching' | undefined>(
    undefined
  );
  const [playingIds, setPlayingIds] = useState<Set<number>>(new Set());

  const fetchWatchlist = async (status?: 'planned' | 'watched' | 'watching') => {
    try {
      setLoading(true);
      setError(null);
      const watchlistItems = await watchlistService.getWatchlist(status);
      setItems(watchlistItems);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
      setError('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist(activeStatus);
  }, [activeStatus]);

  const handleRemoveFromWatchlist = async (movieId: number) => {
    if (removingIds.has(movieId)) return;

    try {
      setRemovingIds(prev => new Set(prev).add(movieId));
      await watchlistService.removeFromWatchlist(movieId);
      setItems(prev => prev.filter(item => item.movie.id !== movieId));
    } catch (err) {
      console.error('Error removing movie from watchlist:', err);
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(movieId);
        return newSet;
      });
    }
  };

  const handleStatusChange = async (status: string) => {
    const validStatus = status === '' ? undefined : status as 'planned' | 'watched' | 'watching';
    setActiveStatus(validStatus);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20 p-6 flex justify-center items-center">
        <div className="spinner-border animate-spin h-8 w-8 border-t-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20 p-6">
      <NavBar />
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Watchlist</h1>
          <div className="flex gap-4">
            <select 
              className="bg-gray-800 text-white px-4 py-2 rounded-lg"
              onChange={(e) => handleStatusChange(e.target.value)}
              value={activeStatus || ''}
            >
              <option value="">All Items</option>
              <option value="planned">Planned</option>
              <option value="watching">Watching</option>
              <option value="watched">Watched</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="text-red-500 mb-4">
            {error}
          </div>
        )}
        
        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">
              {activeStatus 
                ? `No ${activeStatus} movies in your watchlist`
                : 'Your watchlist is empty'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center bg-gray-800 rounded-lg p-4 transition-all duration-200 hover:bg-gray-700"
              >
                {/* Movie Poster */}
                <img 
                  src={getFullPosterUrl(item.movie.poster_path)}
                  alt={item.movie.title} 
                  className="h-24 w-16 object-cover bg-gray-700 mr-4 rounded"
                />
                
                {/* Movie Details */}
                <div className="flex-grow">
                  <Link 
                    to={`/movie/${item.movie.id}`} 
                    className="text-gray-300 hover:text-white font-bold text-lg transition-colors duration-200"
                  >
                    {item.movie.title}
                  </Link>
                  <div className="text-gray-400">
                    <p className="text-sm mt-1">Added: {new Date(item.addedAt).toLocaleDateString()}</p>
                    {item.movie.runtime && (
                      <p>Duration: {item.movie.runtime} mins</p>
                    )}
                    <p className="text-sm mt-1">
                      Status: <span className="capitalize">{item.status}</span>
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                <button 
                  className="bg-green-600 p-2 rounded hover:bg-green-700 transition-colors duration-200" 
                  title="Play Movie"
                  onClick={() => playMovie({
                      movieId: item.movie.id,
                      onPlayStart: () => setPlayingIds(prev => new Set(prev).add(item.movie.id)),
                      onPlayEnd: () => setPlayingIds(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(item.movie.id);
                          return newSet;
                      }),
                      onError: () => setPlayingIds(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(item.movie.id);
                          return newSet;
                      })
                  })}
                  disabled={playingIds.has(item.movie.id)}
              >
                  {playingIds.has(item.movie.id) ? (
                      <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full" />
                  ) : (
                      <Play size={20} />
                  )}
              </button>
                  <button 
                    className="bg-red-600 p-2 rounded hover:bg-red-700 transition-colors duration-200" 
                    title="Remove from Watchlist"
                    onClick={() => handleRemoveFromWatchlist(item.movie.id)}
                    disabled={removingIds.has(item.movie.id)}
                  >
                    {removingIds.has(item.movie.id) ? (
                      <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full" />
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;