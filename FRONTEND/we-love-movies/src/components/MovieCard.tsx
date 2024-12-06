import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Heart, Info, Check } from 'lucide-react';
import { Movie } from '../types/interfaces';
import { getFullPosterUrl } from '../utilities/getPoster';
import { normalizeMovieGenres } from '../utilities/genreUtils';
import { usePlay } from '../hooks/usePlay';
import { useWatchlist } from '../hooks/useWatchlist';


interface MovieCardProps {
    movie: Movie;
  }

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const { isPlaying, handlePlay, isDisabled } = usePlay({ 
      movieId: movie.id 
    });

    const { isInWatchlist, isLoading: watchlistLoading, toggleWatchlist } = useWatchlist({
      movieId: movie.id
    });
  
  
    return (
      <div
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="h-96 w-full bg-cover bg-center rounded-lg relative"
          style={{
            backgroundImage: `url(${movie.poster_path ? getFullPosterUrl(movie.poster_path) : '/placeholder-poster.jpg'})`,
            backgroundSize: 'cover',
          }}
        >
          {isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-end p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex space-x-2">
                  <button
                    onClick={handlePlay}
                    disabled={isDisabled}
                    className="bg-white text-black p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Play"
                  >
                    {isPlaying ? (
                      <div className="animate-spin h-6 w-6 border-t-2 border-black rounded-full" />
                    ) : (
                      <PlayCircle size={24} />
                    )}
                  </button>

                  <button
                    onClick={toggleWatchlist}
                    disabled={watchlistLoading}
                    className={`
                      ${isInWatchlist ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}
                      text-white p-2 rounded-full
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors duration-200
                    `}
                    title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  >
                    {watchlistLoading ? (
                      <div className="animate-spin h-6 w-6 border-t-2 border-white rounded-full" />
                    ) : isInWatchlist ? (
                      <Check size={24} />
                    ) : (
                      <Heart size={24} />
                    )}
                  </button>
                </div>
                <Link to={`/movie/${movie.id}`}>
                  <button
                    className="bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600"
                    title="More Info"
                  >
                    <Info size={24} />
                  </button>
                </Link>
              </div>
              <div>
                <h3 className="text-white font-bold">{movie.title}</h3>
                <p className="text-gray-300 text-sm">
                  {normalizeMovieGenres(movie).map(genre => genre.name).join(' • ')} • {movie.vote_average.toFixed(1)}/10
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
};

export default MovieCard;