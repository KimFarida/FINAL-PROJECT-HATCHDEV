import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity('genres')
export class Genre {
  @PrimaryColumn('int')
  id!: number;

  @Column('varchar')
  name!: string; 


}
