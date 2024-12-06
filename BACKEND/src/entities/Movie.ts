import { 
    Entity, 
    PrimaryColumn, 
    Column, 
    OneToMany,

  } from "typeorm";

  import { WatchlistItem } from "./WatchlistItem";
  
  @Entity('movies')
  export class Movie {
    @PrimaryColumn('int')
    id!: number; 
  
    @Column('varchar')
    title!: string; 
  
    @Column('int', { array: true, nullable: true })
    genre_ids?: number[]; 
  
    @Column('text', { nullable: true })
    overview?: string;
  
    @Column('float', { nullable: true })
    vote_average?: number;
  
    @Column('int', { nullable: true })
    runtime?: number;
  
    @Column('varchar', { nullable: true })
    poster_path?: string; 
  
    @Column('varchar', { nullable: true })
    backdrop_path?: string;
  
    @Column('date')
    release_date?: Date;
  
    @Column('varchar')
    original_language!: string;
  
    @Column('float', { nullable: true })
    popularity?: number;

    @OneToMany(() => WatchlistItem, watchlistItem => watchlistItem.movie)
  watchlistItems?: WatchlistItem[];
  }
  