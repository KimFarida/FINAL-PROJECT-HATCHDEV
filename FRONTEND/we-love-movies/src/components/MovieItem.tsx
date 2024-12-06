import { Play, Heart, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Movie } from '../types/interfaces';
import { getFullPosterUrl } from '../utilities/getPoster';
import { usePlay } from '../hooks/usePlay';
import { useWatchlist } from '../hooks/useWatchlist';

interface MovieItemProps {
    movie: Movie;
  }
  
  const MovieItem: React.FC<MovieItemProps> = ({ movie }) => {
    const { isPlaying, handlePlay, isDisabled } = usePlay({ movieId: movie.id });
    const { isInWatchlist, isLoading: watchlistLoading, toggleWatchlist } = useWatchlist({
      movieId: movie.id
    });
  
    return (
      <div className="flex items-center bg-gray-800 rounded-lg p-4 transition-all duration-200 hover:bg-gray-700">
        {/* Movie Poster */}
        <img 
          src={getFullPosterUrl(movie.poster_path)}
          alt={movie.title} 
          className="h-24 w-16 object-cover bg-gray-700 mr-4 rounded"
        />
        
        {/* Movie Details */}
        <div className="flex-grow">
          <Link 
            to={`/movie/${movie.id}`} 
            className="text-gray-300 hover:text-white font-bold text-lg transition-colors duration-200"
          >
            {movie.title}
          </Link>
          <div className="text-gray-400">
            {movie.runtime && (
              <p>Duration: {movie.runtime} mins</p>
            )}
            <p className="text-sm mt-1">Rating: {movie.vote_average.toFixed(1)}/10</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button 
            className="bg-green-600 p-2 rounded hover:bg-green-700 transition-colors duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed" 
            title="Play Movie"
            onClick={handlePlay}
            disabled={isDisabled}
          >
            {isPlaying ? (
              <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full" />
            ) : (
              <Play size={20} />
            )}
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              toggleWatchlist();
            }}
            disabled={watchlistLoading}
            className={`
              ${isInWatchlist ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}
              p-2 rounded transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            {watchlistLoading ? (
              <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full" />
            ) : isInWatchlist ? (
              <Check size={20} />
            ) : (
              <Heart size={20} />
            )}
          </button>
        </div>
      </div>
    );
  };

export default MovieItem