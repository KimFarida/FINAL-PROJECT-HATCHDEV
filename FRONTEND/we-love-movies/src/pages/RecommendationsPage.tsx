import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { userService } from '../api/user';
import MovieCard from '../components/MovieCard';
import { MovieRecommendation } from '../types/interfaces';


const RecommendationsPage: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moods = ['Feel Good', 'Adventurous', 'Romantic', 'Thriller', 'Emotional'];

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async (mood?: string) => {
    try {
      setLoading(true);
      setError(null);
      const recs = await userService.getRecommendations(mood);
      setRecommendations(recs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelection = (mood: string) => {
    if (selectedMood === mood) {
      setSelectedMood('');
      fetchRecommendations();
    } else {
      setSelectedMood(mood);
      fetchRecommendations(mood);
    }
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
      <NavBar/>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {selectedMood ? `${selectedMood} Movies` : 'Recommended For You'}
          </h1>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodSelection(mood)}
                className={`px-4 py-2 rounded transition-all ${
                  selectedMood === mood 
                    ? 'bg-blue-600 ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">
              {selectedMood 
                ? `No recommendations found for ${selectedMood} mood` 
                : 'No recommendations available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendations.map((movie) => (
              <div key={movie.id} className="relative">
                <MovieCard movie={movie} />
                <div className="absolute top-2 right-2 z-10">
                  <span className="bg-blue-500/90 text-white px-2 py-1 rounded text-sm">
                    {movie.matchScore.toFixed(1)}% Match
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;