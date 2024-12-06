import React, { useState } from 'react';
import { Star, List, TrendingUp, Clock } from 'lucide-react';
import NavBar from '../components/NavBar';
import MovieGrid from '../components/MovieGrid';
import MovieHeroSection from '../components/MovieHeroSection';
import SearchBar from '../components/SearchBar';
import Filter from '../components/Filter'; 


type MovieListType = 'recently-watched' | 'now-playing' | 'top-rated' | 'upcoming';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]); 
  const [activeMovieList, setActiveMovieList] = useState<MovieListType>('recently-watched');

  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters);
  };

  const movieListOptions = [
    { 
      type: 'recently-watched', 
      label: 'Recently Watched', 
      icon: <List className="mr-2" /> 
    },
    { 
      type: 'now-playing', 
      label: 'Now Playing', 
      icon: <Star className="mr-2" /> 
    },
    { 
      type: 'top-rated', 
      label: 'Top Rated', 
      icon: <TrendingUp className="mr-2" /> 
    },
    { 
      type: 'upcoming', 
      label: 'Upcoming', 
      icon: <Clock className="mr-2" /> 
    }
  ];


  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NavBar />
      <div className="container mx-auto max-w-screen-lg pt-24 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Discover Movies</h1>

          {/* Search Input */}
          <SearchBar
            searchQuery={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search movies..."
          />

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-6">
            {/* Filters Button */}
            <Filter onFilterChange={handleFilterChange} />
            
            <button className="bg-green-600 px-4 py-2 rounded flex items-center hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400">
              <Star className="mr-2" /> Recommended
            </button>

            
          </div>
        </header>

        {!searchQuery && <MovieHeroSection />}

        {/* Movie Grid */}
        <div className="flex space-x-2 mt-8 mb-8">
              {movieListOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => setActiveMovieList(option.type as MovieListType)}
                  className={`
                    px-4 py-2 rounded flex items-center 
                    ${activeMovieList === option.type 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-700 hover:bg-gray-600'}
                    focus:outline-none focus:ring-2 focus:ring-green-400
                  `}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
        <h2 className="text-2xl font-bold mb-2">
          {searchQuery ? 
          `Search Results for "${searchQuery}"` 
          :  movieListOptions.find(opt => opt.type === activeMovieList)?.label
          }
        </h2>
        <MovieGrid 
          searchQuery={searchQuery} 
          activeFilters={activeFilters}
          movieListType={activeMovieList}
        />
      </div>
    </div>
  );
};

export default HomePage;
