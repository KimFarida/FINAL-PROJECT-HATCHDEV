import { Router } from 'express';
import { PlayerController } from '../controllers/streamController';
import authenticateJWT from '../middlewares/authenticateJwt';


const streamRouter = Router();

streamRouter.use(authenticateJWT); 

streamRouter.get('/', PlayerController.getPlayer)


export default streamRouter;
