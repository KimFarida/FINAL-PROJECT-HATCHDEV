import { Request, Response, NextFunction } from 'express';
import JwtService from '../services/jwtService';
import { CustomError } from '../utils/customError';


export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;  
}

const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next(new CustomError('Access denied', 403));
  }

  try {
    const decoded = JwtService.verifyAccessToken(token);
    req.user = decoded; 
    console.log(req.user)
    next();
  } catch (error) {
    return next(new CustomError('Invalid token', 401));
  }
};

export default authenticateJWT;

