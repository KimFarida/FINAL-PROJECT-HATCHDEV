import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, refreshUserToken } from '../services/userService'; 
import { CustomError } from '../utils/customError'; 

class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password } = req.body;
            const { user, tokens } = await registerUser(username, email, password);


            //Set tokens in cookies for later
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            res.status(201).json({ 
                user, 
                accessToken: tokens.accessToken 
            });
            
        } catch (error) {
            if (error instanceof CustomError) {
                return next(error);
            }
            
            console.error('Unexpected error during registration:', error);
            return next(new CustomError('Registration failed', 500));
        }
    } 
    
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const { user, tokens } = await loginUser(email, password);

            //Set refresh token in HTTP-only cookie 
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.status(200).json({ 
                user, 
                accessToken: tokens.accessToken 
            });

        } catch (error) {
            if (error instanceof CustomError) {
                return next(error);
            }
            
            return next(new CustomError('Login failed', 401));
        }
    }

        static async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            // Get refresh token from cookie
            const refreshToken = req.cookies.refreshToken;
            
            if (!refreshToken) {
                throw new CustomError('Refresh token not found', 401);
            }

            const { accessToken } = await refreshUserToken(refreshToken);
            
            res.status(200).json({ accessToken });
        } catch (error) {
            if (error instanceof CustomError) {
                return next(error);
            }
            return next(new CustomError('Token refresh failed', 401));
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            // Clear the refresh token cookie
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });
            
            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            return next(new CustomError('Logout failed', 500));
        }
    }

}

export default AuthController;