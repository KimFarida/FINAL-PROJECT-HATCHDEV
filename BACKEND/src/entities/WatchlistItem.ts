import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne,
    JoinColumn 
  } from "typeorm";
  import { Movie } from "./Movie";
  import { User } from "./User";
  
  @Entity('watchlist_items')
  export class WatchlistItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()  
    movieId!: number;

    @Column()  
    userId!: string;

    @ManyToOne(() => Movie, { eager: true })
    @JoinColumn({ name: 'movieId' }) 
    movie!: Movie; 

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'userId' })  
    user!: User;
    
    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    addedAt!: Date;
  
    @Column('enum', { 
      enum: ['planned', 'watched', 'watching'],
      default: 'planned'
    })
    status!: 'planned' | 'watched' | 'watching'; 

  }
  