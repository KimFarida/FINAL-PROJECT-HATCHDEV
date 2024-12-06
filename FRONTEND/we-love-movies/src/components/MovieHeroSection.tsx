import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Star, Heart, Check } from 'lucide-react';
import { Movie } from '../types/interfaces';
import { normalizeMovieGenres } from '../utilities/genreUtils';
import { tmdbService } from '../api/tmdbService';
import { useWatchlist } from '../hooks/useWatchlist';
import { getFullPosterUrl } from '../utilities/getPoster';
import { usePlay } from '../hooks/usePlay';

const MovieHeroSection: React.FC = () => {
    const [currentMovieIdx, setCurrentMovieIdx] = useState<number>(0);
    const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    

     const currentMovieId = featuredMovies[currentMovieIdx]?.id;

     //HOOKS
     const { isPlaying, handlePlay, isDisabled } = usePlay({ 
        movieId: currentMovieId
    });

    const { isInWatchlist, isLoading: watchlistLoading, toggleWatchlist } = useWatchlist({
         movieId: currentMovieId  // Use nullish coalescing
     });

    // Fetch discover movies
    useEffect(() => {
        const fetchFeaturedMovies = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await tmdbService.getMovies('discover', 1);
                //console.log(response)
                // Get first 5 movies for the hero section
                setFeaturedMovies(response.results.slice(0, 10));
            } catch (err) {
                console.error('Error fetching featured movies:', err);
                setError('Failed to load featured movies');
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedMovies();
    }, []);

    // Handle movie rotation
    useEffect(() => {
        if (featuredMovies.length === 0) return;

        const interval = setInterval(() => {
            setCurrentMovieIdx((prevIdx) => (prevIdx + 1) % featuredMovies.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [featuredMovies]);


    if (loading) {
        return (
            <div className="w-full h-[600px] flex justify-center items-center bg-gray-900">
                <div className="spinner-border animate-spin h-8 w-8 border-t-4 border-blue-500 rounded-full"></div>
            </div>
        );
    }

    if (error || featuredMovies.length === 0) {
        return (
            <div className="w-full h-[600px] flex justify-center items-center bg-gray-900 text-white">
                <p>{error || 'No movies available'}</p>
            </div>
        );
    }

    const currentMovie = featuredMovies[currentMovieIdx];
    const normalizedGenres = normalizeMovieGenres(currentMovie);


    return (
        <div className="relative w-full h-[600px] overflow-hidden mb-10">
            {/* Background Image */}
            <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                style={{ 
                    backgroundImage: `url(${getFullPosterUrl(currentMovie.backdrop_path || currentMovie.poster_path)})`,
                    filter: 'brightness(50%)' 
                }}
            />

            {/* Content Overlay */}
            <div className="relative z-10 flex items-center h-full container mx-auto px-4">
                <div className="w-1/2 text-white">
                    <Link to={`/movie/${currentMovie.id}`}>
                        <h1 className="text-4xl font-bold mb-4 text-gray-300 hover:text-gray-100 transition-colors duration-200">
                            {currentMovie.title}
                        </h1>
                    </Link>

                    <div className="flex items-center space-x-4 mb-4">
                        {normalizedGenres.map((genre) => (
                            <span 
                                key={genre.id} 
                                className="bg-gray-700 px-3 py-1 rounded-full text-sm"
                            >
                                {genre.name}
                            </span>
                        ))}
                        <div className="flex items-center">
                            <Star className="text-yellow-500 mr-2" fill="currentColor" />
                            <span>{currentMovie.vote_average.toFixed(1)}</span>
                        </div>
                    </div>

                    <p className="text-lg mb-6 line-clamp-3">
                        {currentMovie.overview}
                    </p>

                    <div className="flex flex-wrap gap-4">
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
                                <Heart className="mr-2" />
                            )}
                            {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                            </button>
                    </div>
                </div>

                {/* Poster */}
                <div className="w-1/2 flex justify-end">
                    <img 
                        src={getFullPosterUrl(currentMovie.poster_path)}
                        alt={currentMovie.title}
                        className="w-[300px] h-[450px] object-cover rounded-lg shadow-2xl"
                    />
                </div>
            </div>
        </div>
    );
};

export default MovieHeroSection;