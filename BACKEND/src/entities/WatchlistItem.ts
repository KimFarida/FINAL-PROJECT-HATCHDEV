import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne 
  } from "typeorm";
  import { Movie } from "./Movie";
  import { User } from "./User";
  
  @Entity('watchlist_items')
  export class WatchlistItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @ManyToOne(() => Movie, { eager: true })
    movie!: Movie; 
  
    @ManyToOne(() => User, { eager: true })
    user!: User;
  
    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    addedAt!: Date;
  
    @Column('enum', { 
      enum: ['planned', 'watched', 'watching'],
      default: 'planned'
    })
    status!: 'planned' | 'watched' | 'watching'; 

  }
  