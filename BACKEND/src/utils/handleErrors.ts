import { CustomError } from "./customError";
import { AxiosError } from "axios";
import { TMDBErrorResponse } from "../types/error";

// Helper function to handle Axios errors
export const handleAxiosError = (error: AxiosError<TMDBErrorResponse>): never => {
    if (error.response) {
      // The request was made and the server responded with a status code
      throw new CustomError(
        error.response.data?.status_message || 'Error in TMDB API', 
        error.response.status || 500, 
        'TMDB_API_ERROR'
      );
    } else if (error.request) {
      // The request was made but no response was received
      throw new CustomError('No response from TMDB', 503, 'TMDB_NO_RESPONSE');
    }
    
    // Something happened in setting up the request
    throw new CustomError('Error setting up TMDB request', 500, 'TMDB_REQUEST_ERROR');
  };