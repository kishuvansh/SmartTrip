import { Router } from 'express';
import { getTrips, createTrip, getTripById, toggleFavorite, deleteTrip, getActiveTrip, upsertActiveTrip, deleteActiveTrip } from '../controllers/tripsController';
import { verifyToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { body } from 'express-validator';

const router = Router();

router.use(verifyToken);

router.get('/active', getActiveTrip);
router.put('/active', upsertActiveTrip);
router.delete('/active', deleteActiveTrip);

router.get('/', getTrips);

router.post('/', [
    body('destination').isString().notEmpty(),
    body('origin').isString().notEmpty(),
    body('dates').isString().notEmpty(),
    body('itineraryJson').isObject().notEmpty(),
    body('selectedFlight').optional().isObject(),
    body('selectedHotel').optional().isObject(),
    validateRequest
], createTrip);

router.get('/:id', getTripById);

router.put('/:id/favorite', toggleFavorite);

router.delete('/:id', deleteTrip);

export default router;
