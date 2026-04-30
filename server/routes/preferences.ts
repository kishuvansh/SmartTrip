import { Router } from 'express';
import { getPreferences, updatePreferences } from '../controllers/preferencesController';
import { verifyToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { body } from 'express-validator';

const router = Router();

router.use(verifyToken);

router.get('/', getPreferences);

router.put('/', [
    body('preferredAirlines').optional().isArray(),
    body('hotelStarRating').optional().isInt({ min: 1, max: 5 }),
    body('seatPreference').optional().isIn(['window', 'aisle', 'middle']),
    body('mealPreference').optional().isIn(['veg', 'non-veg', 'vegan']),
    body('interests').optional().isArray(),
    body('budgetRange').optional().isObject(),
    body('budgetRange.min').optional().isNumeric(),
    body('budgetRange.max').optional().isNumeric(),
    body('budgetRange.currency').optional().isString(),
    body('travelerType').optional().isIn(['solo', 'couple', 'family']),
    validateRequest
], updatePreferences);

export default router;
