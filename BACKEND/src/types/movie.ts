export interface Movie{
    id: number;
    title: string;
    genres?: Genre[];
    genre_ids?: Number[]
    overview?: string;
    vote_average?: number;
    runtime?: number;
    poster_path?: string;
    backdrop_path?: string;
    release_date?: string;
    original_language: string;
    popularity?: number
}

export interface Genre {
    id: number; 
    name: string; 
}