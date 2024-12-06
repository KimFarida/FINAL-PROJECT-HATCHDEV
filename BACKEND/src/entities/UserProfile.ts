import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToOne,
    CreateDateColumn,
    UpdateDateColumn
    
  } from "typeorm";
  import { User } from "./User";

  @Entity('profiles')
  export class Profile {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column('int', { default: 0 })
    currentStreak: number = 0;

    @Column('int', { default: 0 })
    longestStreak: number = 0;

    @Column('timestamp', { nullable: true })
    lastWatchDate: Date | null = null;
  
    @Column('simple-array', { nullable: true })
    watchedMovies: number[] = [];
  
    @Column('timestamp', { nullable: true })
    streakResetDate: Date | null = null;
  
    @Column('jsonb', { nullable: true })
    preferences: {
      favoriteGenres: number[];
      watchTime: string;
      moods: string[];
    } = {
      favoriteGenres: [],
      watchTime: '',
      moods: []
    };

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
  
    @OneToOne(() => User, user => user.profile)
    user!: User;
  }
  
  