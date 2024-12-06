import React, { useState, useEffect } from 'react';
import { Movie } from '../types/interfaces';
import { tmdbService } from '../api/tmdbService';
import { normalizeMovieGenres } from '../utilities/genreUtils';
import MovieCard from './MovieCard';

interface MovieGridProps {
  searchQuery: string;
  activeFilters: string[];
  movieListType: 'recently-watched' | 'now-playing' | 'top-rated' | 'upcoming';
  customMovies?: Movie[];
}

const MovieGrid: React.FC<MovieGridProps> = ({
  searchQuery,
  activeFilters,
  movieListType,
  customMovies
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchMovies = async () => {
      if (customMovies) {
        setMovies(customMovies);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = searchQuery
          ? await tmdbService.searchMovies(searchQuery, page)
          : await tmdbService.getMovies(movieListType, page);
        
        // Check if response and results exist
        if (response?.results) {
          setMovies(response.results);
          setTotalPages(response.total_pages || 1);
        } else {
          setMovies([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
        setError('Failed to fetch movies');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [movieListType, searchQuery, page, customMovies]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, movieListType]);

  const handleNextPage = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  // Ensure movies is an array before filtering
  const filteredMovies = movies && Array.isArray(movies) ? movies.filter((movie) => {
    if (!movie) return false;
    const matchesSearchQuery = movie.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const normalizedGenres = normalizeMovieGenres(movie);
    const matchesFilters = activeFilters.length === 0 || 
      normalizedGenres?.some(genre => activeFilters.includes(genre.name));
    return matchesSearchQuery && matchesFilters;
  }) : [];

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center">
        <div className="spinner-border animate-spin h-8 w-8 border-t-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-white p-4"><p>{error}</p></div>;
  }

  if (!filteredMovies.length) {
    return <div className="text-white p-4">No movies found</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {filteredMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
  
      <div className="flex justify-center mt-8 gap-4">
        <button 
          onClick={handlePrevPage} 
          disabled={page === 1}
          className="px-6 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-white">
          Page {page} of {totalPages}
        </span>
        <button 
          onClick={handleNextPage}
          disabled={page === totalPages}
          className="px-6 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MovieGrid;
