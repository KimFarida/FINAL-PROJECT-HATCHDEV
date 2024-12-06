import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('moods')
export class Mood {
  @PrimaryGeneratedColumn('uuid')
  id!: string; 

  @Column('varchar')
  name!: string;

  @Column('int', { array: true })
  associatedGenres!: number[]; 


}
