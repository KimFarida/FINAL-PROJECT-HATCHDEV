import { Router } from 'express';
import TMDBMovieController from '../controllers/tdmbMovieController';
import authenticateJWT from '../middlewares/authenticateJwt';

const movieRoutes = Router();

movieRoutes.use(authenticateJWT)

// Test Route
movieRoutes.get('/', (req, res) => {
  res.send('Movies API Documentation');
});

// Genre and Search routes
movieRoutes.get('/genres', TMDBMovieController.getMovieGenres);
movieRoutes.get('/search', TMDBMovieController.searchMovies);

// Discover and List routes
movieRoutes.get('/discover', TMDBMovieController.discoverMovies);
movieRoutes.get('/now-playing', TMDBMovieController.getNowPlayingMovies);
movieRoutes.get('/popular', TMDBMovieController.getPopularMovies);
movieRoutes.get('/top-rated',TMDBMovieController.getTopRatedMovies);
movieRoutes.get('/upcoming', TMDBMovieController.getUpcomingMovies);

// Movie details routes
movieRoutes.get('/:id', TMDBMovieController.getMovieById);
movieRoutes.get('/:id/similar', TMDBMovieController.getSimilarMovies);

export default movieRoutes;