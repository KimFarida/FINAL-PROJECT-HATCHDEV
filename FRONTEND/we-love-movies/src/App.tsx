import React, { useEffect } from 'react';
import { 
  RouterProvider, 
  createBrowserRouter, 
  Navigate 
} from 'react-router-dom';
import { tmdbService } from './api/tmdbService.ts';
import { initializeGenreMap } from './utilities/genreUtils.ts'

import AuthPage from './pages/AuthPage.tsx';
import HomePage from './pages/HomePage.tsx';
import WatchlistPage from './pages/WatchListPage.tsx';
import RecommendationsPage from './pages/RecommendationsPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import MovieDetailPage from './pages/MovieDetailPage.tsx';
import PrivateRoute from './components/PrivateRoute';

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <HomePage />
      </PrivateRoute>
    )
  },
  {
    path: '/watchlist',
    element: (
      <PrivateRoute>
        <WatchlistPage />
      </PrivateRoute>
    )
  },
  {
    path: '/recommendations',
    element: (
      <PrivateRoute>
        <RecommendationsPage />
      </PrivateRoute>
    )
  },
  {
    path: '/profile',
    element: (
      <PrivateRoute>
        <ProfilePage />
      </PrivateRoute>
    )
  },
  {
    path: '/movie/:id',
    element: (
      <PrivateRoute>
        <MovieDetailPage />
      </PrivateRoute>
    )
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

const App: React.FC = () => {

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const genres = await tmdbService.getGenres();
        await initializeGenreMap(genres);
      } catch (error) {
        console.error('Failed to initialize genre mapping:', error);
      }
    };

    initializeApp();
  }, []);

  return <RouterProvider router={router} />;
};

export default App;

