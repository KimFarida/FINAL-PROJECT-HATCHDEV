import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne 
  } from "typeorm";
  import { User } from "./User";
  
  @Entity('reminders')
  export class Reminder {
    @PrimaryGeneratedColumn('uuid')
    id!: string; 
  
    @Column('varchar')
    movieId!: string;
  
    @Column('timestamp')
    reminderTime!: Date;
  
    @Column('text', { nullable: true })
    message?: string;
  
    @ManyToOne(() => User, user => user.reminders)
    user!: User; 
  }
  