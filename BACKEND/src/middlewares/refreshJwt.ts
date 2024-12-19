import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/customError';
import JwtService from '../services/jwtService';

interface RequestWithUser extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
    };
}
export const verifyRefreshToken = (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            throw new CustomError('Refresh token not found', 401);
        }

        // Verify the refresh token
        const payload = JwtService.verifyRefreshToken(refreshToken);
        
        // Attach the payload to the request for use in the controller
        req.user = payload;
        
        next();
    } catch (error) {
        if (error instanceof Error) {
            return next(new CustomError('Invalid refresh token', 401));
        }
        return next(new CustomError('Authentication failed', 401));
    }
};
