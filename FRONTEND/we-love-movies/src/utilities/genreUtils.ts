import { Movie, Genre } from "../types/interfaces";
  
  // We'll populate this map when the app loads
  let genreMap: Map<number, string> = new Map();
  
  // Function to initialize the genre map
  export const initializeGenreMap = async (genres: Genre[]) => {
    genreMap = new Map(genres.map(genre => [genre.id, genre.name]));
  };
  
  // Function to normalize movie genres
  export const normalizeMovieGenres = (movieData: Movie): Genre[] => {
    // If we already have genre objects with id and name, return them
    if (Array.isArray(movieData.genres) && movieData.genres.length > 0 && 'name' in movieData.genres[0]) {
        return movieData.genres;
    }
  
    // If we have genre_ids, convert them to genre objects
    if (Array.isArray(movieData.genre_ids)) {
      return movieData.genre_ids.map(id => ({
        id,
        name: genreMap.get(id) || ''
      }));
    }
  
    // Fallback case
    return [];
  };
  
  // Utility function to safely get genre names
  export const getGenreNames = (movie: any): string[] => {
    const genres = normalizeMovieGenres(movie);
    return genres.map(genre => genre.name);
  };