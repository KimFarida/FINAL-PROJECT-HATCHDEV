import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/interfaces';
import { StreakStats, PreferenceResponse, WatchTime } from '../types/interfaces';
import { Film, Star, Clock, Trophy, Plus } from 'lucide-react';
import NavBar from '../components/NavBar';
import StatCard from '../components/StatCard';
import WatchTimeSelector from '../components/WatchTimeSelector';
import RecentlyWatchedSection from '../components/RecentlyWatchedSection';
import { userService } from '../api/user';
import { initializeGenreMap} from '../utilities/genreUtils';
import { getWatchTimeIcon } from '../utilities/getWatchTimeIcon';



const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [streakStats, setStreakStats] = useState<StreakStats | null>(null);
  const [preferences, setPreferences] = useState<PreferenceResponse | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedWatchTime, setSelectedWatchTime] = useState<WatchTime | ''>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [userData, streakData, preferencesData] = await Promise.all([
          userService.getProfile(),
          userService.getStreakStats(),
          userService.getAllPreferences()
        ]);

        setUser(userData);
        setStreakStats(streakData);
        setPreferences(preferencesData);
        setSelectedGenres(preferencesData.genres.favorites);

        // Initialize genre map with available genres
        await initializeGenreMap(preferencesData.genres.available);

        if (preferences?.basics.watchTime) {
          setSelectedWatchTime(preferences.basics.watchTime);
        }
      
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate('/auth');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch user data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleUpdateGenres = async () => {
    try {
      const updatedPreferences = await userService.updateGenres(selectedGenres);
      setPreferences(updatedPreferences);
      return Promise.resolve();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update genres');
      return Promise.reject(error);
    }
  };

  const toggleGenre = (genreId: number) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const GenreContent = (
    <div className="flex flex-wrap gap-2">
      {preferences?.genres.available.map(genre => (
        <button
          key={genre.id}
          onClick={() => toggleGenre(genre.id)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            selectedGenres.includes(genre.id)
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
          }`}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );

  const GenreValue = (
    <div className="flex flex-wrap gap-1 justify-center">
      {preferences?.genres.favorites.length ? (
        preferences.genres.favorites.map(genreId => {
          const genre = preferences.genres.available.find(g => g.id === genreId);
          return (
            <span 
              key={genreId} 
              className="bg-gray-600 px-2 py-1 rounded-full text-sm"
            >
              {genre?.name || ''}
            </span>
          );
        })
      ) : (
        <div className="flex items-center justify-center text-gray-400">
          <Plus className="w-4 h-4 mr-1" />
          Add Genres
        </div>
      )}
    </div>
  );

  const handleUpdateWatchTime = async () => {
    try {
      const updatedPreferences = await userService.updatePreferences({
        watchTime: selectedWatchTime as WatchTime
      });
      setPreferences(updatedPreferences);
      return Promise.resolve();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update watch time');
      return Promise.reject(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="spinner-border animate-spin h-8 w-8 border-t-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getLastWatchDateString = (date: Date | null) => {
    if (!date) return 'No movies watched yet';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };


return (
    <div className="min-h-screen bg-gray-900 text-white pt-20 p-6">
      <NavBar/>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full mr-4"></div>
            <div>
              <h2 className="text-xl font-semibold">{user?.username}</h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <StatCard 
              icon={<Film className="mx-auto" />}
              title="Current Streak"
              value={`${streakStats?.currentStreak || 0} Days`}
              subtitle={`Last watched: ${getLastWatchDateString(streakStats?.lastWatchDate ?? null)}`}
            />
            <StatCard 
              icon={<Trophy className="mx-auto text-yellow-500" />}
              title="Longest Streak"
              value={`${streakStats?.longestStreak || 0} Days`}
            />
            <StatCard 
              icon={<Star className="mx-auto text-yellow-500" />}
              title="Favorite Genres"
              value={GenreValue}
              isInteractive={true}
              modalContent={GenreContent}
              modalTitle="Select Your Favorite Genres"
              onSave={handleUpdateGenres}
            />
            <StatCard 
              icon={<Clock className="mx-auto" />}
              title="Preferred Watch Time"
              value={
                preferences?.basics.watchTime ? (
                  <div className="flex items-center justify-center gap-2">
                    {getWatchTimeIcon(preferences.basics.watchTime)}
                    <span className="capitalize">{preferences.basics.watchTime}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-gray-400">
                    <Plus className="w-4 h-4 mr-1" />
                    Set Watch Time
                  </div>
                )
              }
              isInteractive={true}
              modalContent={
                <WatchTimeSelector
                  currentValue={selectedWatchTime}
                  onSelect={setSelectedWatchTime}
                />
              }
              modalTitle="Set Preferred Watch Time"
              onSave={handleUpdateWatchTime}
            />
                      </div>

          <RecentlyWatchedSection onError={setError} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;