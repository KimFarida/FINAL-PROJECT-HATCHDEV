import { User } from '../entities/User';
import { Profile } from '../entities/UserProfile';
import { AppDataSource } from '../config/database';
import { hash, compare } from 'bcrypt';
import JwtService from './jwtService';
import { CustomError } from '../utils/customError'; 

import { AuthResponse } from '../types/auth';


export const registerUser = async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const userRepository = AppDataSource.getRepository(User);
    const profileRepository = AppDataSource.getRepository(Profile);

    try {
        const existingUserByEmail = await userRepository.findOne({ where: { email } });
        const existingUserByUsername = await userRepository.findOne({ where: { username } });
        
        if (existingUserByEmail) {
            throw new CustomError(' A User with this email already exists', 400);
        }

        if (existingUserByUsername) { 
            throw new CustomError(' A User with this username already exists', 400);
        }

        const hashPassword = await hash(password, 10);

        // Create the profile
        const newProfile = profileRepository.create({
            watchedMovies: [],
            streakResetDate: null,
            preferences: {
                favoriteGenres: [],
                watchTime: '',
                moods: []
            }
        });

        // Create the user
        const newUser = userRepository.create({
            username,
            email,
            password: hashPassword,
        });

        // Assign profile to the user
        newUser.profile = newProfile;

        await profileRepository.save(newProfile);
        await userRepository.save(newUser);

        const tokens = JwtService.createTokens(newUser.id, newUser.email, newUser.username);

        return { user: newUser, tokens };
    } catch (error) {
        throw error;
    }
};

export const loginUser = async (email: string, password: string) => {
    try{
        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOne( {where: {email } });
        if (!user || !(await compare(password, user.password ))){
            throw new CustomError('Invalid credentials. Incorrect email/password', 400);
        }
    
        const tokens = JwtService.createTokens(user.id, user.email, user.username)
    
        return { user, tokens}
    }catch (error) {
        throw error;
    }
 
};

export const refreshUserToken = async (refreshToken: string) => {
    try {
        const userRepository = AppDataSource.getRepository(User);

        const payload = JwtService.verifyRefreshToken(refreshToken)

        const user = await userRepository.findOne( { where: { id: payload.id } })

        if(!user){
            throw new CustomError('User not found', 404)
        }

        const newAccessToken = JwtService.refreshAccessToken(refreshToken);
        
        return { accessToken: newAccessToken };
    } catch (error) {
        if (error instanceof Error) {
            throw new CustomError(error.message, 401);
        }
        throw new CustomError('Token refresh failed', 401);
    
    }
}
