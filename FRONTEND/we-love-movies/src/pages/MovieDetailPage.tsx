import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import MovieGrid from '../components/MovieGrid';
import { useWatchlist } from '../hooks/useWatchlist';
import { Movie } from '../types/interfaces';
import { tmdbService } from '../api/tmdbService';
import { getFullPosterUrl } from '../utilities/getPoster';
import { normalizeMovieGenres } from '../utilities/genreUtils';
import { usePlay } from '../hooks/usePlay';
import { 
  Star, 
  Clock, 
  PlayCircle, 
  BookmarkPlus,
  Loader2,
  Check
} from 'lucide-react';

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isPlaying, handlePlay, isDisabled } = usePlay({ 
    movieId: movie?.id  
  });


  const { isInWatchlist, isLoading: watchlistLoading, toggleWatchlist } = useWatchlist({
    movieId: parseInt(id || '0')
  });
  
  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) {
        setError('No movie ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);

        // Fetch movie details and similar movies in parallel
        const [movieDetails, similarMoviesData] = await Promise.all([
          tmdbService.getMovieById(parseInt(id)),
          tmdbService.getSimilarMovies(parseInt(id))
        ]);

        setMovie(movieDetails);
        setSimilarMovies(similarMoviesData.results || []);
        console.log(similarMoviesData)
      } catch (err) {
        console.error('Error fetching movie data:', err);
        setError('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <NavBar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-900">
        <NavBar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <h1 className="text-2xl font-bold text-white">
            {error || 'Movie not found!'}
          </h1>
        </div>
      </div>
    );
  }

  const genres = normalizeMovieGenres(movie);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NavBar />
      
      {/* Banner Section */}
      <div 
        className="h-64 bg-cover bg-center relative pt-16"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(17,24,39,1)), 
            url(${getFullPosterUrl(movie.backdrop_path || movie.poster_path)})` 
        }}
      >
        <div className="container mx-auto px-4 pt-12 relative z-10">
          <h1 className="text-3xl font-bold">{movie.title}</h1>
          <div className="flex items-center space-x-4 mt-2">
            {genres.map((genre) => (
              <span 
                key={genre.id} 
                className="bg-blue-600 px-2 py-1 rounded text-sm"
              >
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="container mx-auto px-4 mt-6">
        <div className="flex space-x-6">
          <div 
            className="w-32 h-48 bg-cover bg-center bg-gray-800 flex-shrink-0 rounded-lg" 
            style={{ 
              backgroundImage: `url(${getFullPosterUrl(movie.poster_path)})` 
            }}
          ></div>
          
          <div className="flex-grow">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <Star className="text-yellow-500 mr-2" fill="currentColor" />
                <span>{movie.vote_average.toFixed(1)}/10</span>
              </div>
              {movie.runtime && (
                <div className="flex items-center">
                  <Clock className="mr-2" />
                  <span>{movie.runtime} mins</span>
                </div>
              )}
            </div>

            <p className="text-gray-400 mb-4">{movie.overview}</p>

            <div className="flex space-x-4">
            <button 
                onClick={handlePlay}
                disabled={isDisabled}
                className="bg-red-600 hover:bg-red-700 text-white 
                px-6 py-3 rounded-lg flex items-center justify-center w-full sm:w-auto
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPlaying ? (
                    <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full mr-2" />
                ) : (
                  <PlayCircle className="mr-2" />
                )}
                Watch Now
            </button>
              <button 
                onClick={toggleWatchlist}
                disabled={watchlistLoading}
                className={`
                  ${isInWatchlist ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}
                  px-4 py-2 rounded-lg flex items-center transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {watchlistLoading ? (
                  <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full mr-2" />
                ) : isInWatchlist ? (
                  <Check className="mr-2" />
                ) : (
                  <BookmarkPlus className="mr-2" />
                )}
                {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Movies Section */}
      {similarMovies && similarMovies.length > 0 && (
        <div className="container mx-auto px-4 mt-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Similar Movies</h2>
          <MovieGrid 
            searchQuery=""
            activeFilters={[]}
            movieListType="top-rated"
            customMovies={similarMovies}
          />
        </div>
      )}
    </div>
  );
};

export default MovieDetailPage;