import { DataSource } from "typeorm";
import { User } from "../entities/User"; 
import { Profile } from "../entities/UserProfile";
import { Genre } from "../entities/Genre";
import { Mood } from "../entities/Mood";
import { Movie } from "../entities/Movie";
import { Reminder } from "../entities/Reminder";
import { WatchlistItem } from "../entities/WatchlistItem";

import dotenv from "dotenv";


dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.PROD_DB_HOST,
  port: parseInt(process.env.PROD_DB_PORT || '5432'),
  username: process.env.PROD_DB_USER,
  password: process.env.PROD_DB_PASSWORD,
  database: process.env.PROD_DB_NAME,
  synchronize: true, 
  logging: true,
  entities: [
    User,
    Profile,
    Reminder,
    Genre,
    Mood,
    Movie,
    WatchlistItem
  ],
  migrations: [],
  ssl: {
    rejectUnauthorized: false
  }
});


export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connection established successfully");

    const result = await AppDataSource.query("SELECT 1");
    console.log("Database check successful:", result);
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
};

