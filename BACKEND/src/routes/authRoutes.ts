import { Router } from 'express';
import AuthController from '../controllers/authController';
import authenticateJWT from '../middlewares/authenticateJwt';
import { verifyRefreshToken } from '../middlewares/refreshJwt';

const authRoutes = Router();

authRoutes.post('/register', AuthController.register);
authRoutes.post('/login', AuthController.login);
authRoutes.post('/logout', authenticateJWT, AuthController.logout);

authRoutes.post('refresh', verifyRefreshToken, AuthController.refresh)


export default authRoutes ;
