import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  JoinColumn,
  OneToOne,
  OneToMany 
} from "typeorm";
import { Profile } from "./UserProfile";
import { WatchlistItem } from "./WatchlistItem";
import { Reminder } from "./Reminder";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar')
  username!: string;

  @Column('varchar', { unique: true })
  email!: string;

  @Column('varchar')
  password!: string;

  @OneToOne(() => Profile, profile => profile.user, { 
    cascade: true, 
    eager: false 
  })
  @JoinColumn()
  profile!: Profile;

  @OneToMany(() => WatchlistItem, watchlistItem => watchlistItem.user)
  watchlistItems!: WatchlistItem[];

  @OneToMany(() => Reminder, reminder => reminder.user)
  reminders?: Reminder[];
}