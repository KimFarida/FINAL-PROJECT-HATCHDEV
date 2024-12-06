export function getFullPosterUrl(posterPath: string, size: 'w500' | 'original' = 'w500'): string {
    const baseUrl = 'https://image.tmdb.org/t/p/';
    return posterPath ? `${baseUrl}${size}${posterPath}` : '';
}