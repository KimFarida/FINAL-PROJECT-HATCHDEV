import { useState, useCallback } from 'react';
import { playMovie as playMovieUtil } from '../utilities/playUtils'
import { userService } from '../api/user';


interface UsePlayOptions {
    movieId?: number | null ;
}

interface UsePlayReturn{
    isPlaying: boolean
    handlePlay : (e?: React.MouseEvent) => void;
    isDisabled: boolean;
}

export const usePlay = ({movieId} : UsePlayOptions): UsePlayReturn => {
    const [isPlaying, setIsPlaying] = useState(false)

    const handlePlay = useCallback((e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
        }

        if (!movieId) return;

        try {
            // Start playing the movie
            playMovieUtil({
                movieId,
                onPlayStart: async () => {
                    setIsPlaying(true);
                    // Record the watch when movie starts playing
                    try {
                            await Promise.all([
                                userService.recordWatch(),
                                userService.addToRecentlyWatched(movieId)
                            ]);
                            
                    } catch (error) {
                        console.error('Failed to record watch:', error);
                    }
                },
                onPlayEnd: () => setIsPlaying(false),
                onError: () => setIsPlaying(false)
            });
        } catch (error) {
            console.error('Failed to play movie:', error);
            setIsPlaying(false);
        }
    }, [movieId]);


    const isDisabled = isPlaying || !movieId;

    return {
        isPlaying,
        handlePlay,
        isDisabled
    };
};