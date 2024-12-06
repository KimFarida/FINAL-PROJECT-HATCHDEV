import { Router } from 'express';
import WatchlistController  from '../controllers/watchlistController'
import authenticateJWT from '../middlewares/authenticateJwt';


const watchlistRouter = Router();

watchlistRouter.use(authenticateJWT); 

watchlistRouter.post('/',WatchlistController.addToWatchlist);
watchlistRouter.delete('/:movieId', WatchlistController.removeFromWatchlist);
watchlistRouter.patch('/:movieId/status', WatchlistController.updateStatus);
watchlistRouter.get('/', WatchlistController.getWatchlist);
watchlistRouter.get('/:movieId/check', WatchlistController.checkInWatchlist);


export default watchlistRouter;
