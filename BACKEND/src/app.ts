import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import movieRoutes from './routes/movieRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import watchlistRouter from './routes/watchlistRoutes';
import streamRouter from './routes/streamRoutes';
import errorHandler from './middlewares/errorHandler';


const app = express();

// Middleware
app.use(cors({
    credentials: true, 
    origin: process.env.FRONTEND_URL  
  }));
  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

// Routes
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/watchlist', watchlistRouter)
app.use('/api/v1/stream', streamRouter)

app.use(errorHandler);

export default app;