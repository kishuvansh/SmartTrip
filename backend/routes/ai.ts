import { Router } from 'express';
import { chatResponse, extractContext, generateOptions, generateItinerary } from '../controllers/aiController';
import { verifyToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { apiLimiter } from '../middleware/rateLimit';
import { body } from 'express-validator';

const router = Router();

// Apply global rate limiting and authentication to all AI routes
// router.use(apiLimiter);
router.use(verifyToken);

router.post('/chat', [
    body('messages').isArray({ min: 1 }).withMessage('Messages must be a non-empty array'),
    body('messages.*.role').isIn(['user', 'assistant', 'system']).withMessage('Invalid message role'),
    body('messages.*.content').isString().notEmpty().withMessage('Message content is required'),
    validateRequest
], chatResponse);

router.post('/chat/context', [
    body('messages').isArray({ min: 1 }).withMessage('Messages must be a non-empty array'),
    body('messages.*.role').isIn(['user', 'assistant', 'system']).withMessage('Invalid message role'),
    body('messages.*.content').isString().notEmpty().withMessage('Message content is required'),
    validateRequest
], extractContext);

router.post('/options', [
    body('type').isIn(['flights', 'hotels']).withMessage('Type must be flights or hotels'),
    body('origin')
        .if(body('type').equals('flights'))
        .isString().notEmpty().withMessage('Origin is required for flights'),
    body('destination')
        .isString().notEmpty().withMessage('Destination is required'),
    body('dates')
        .if(body('type').equals('flights'))
        .isString().notEmpty().withMessage('Dates are required for flights'),
    body('vibe')
        .if(body('type').equals('hotels'))
        .isString().notEmpty().withMessage('Vibe is required for hotels'),
    validateRequest
], generateOptions);

router.post('/itinerary', [
    body('origin').isString().notEmpty().withMessage('Origin is required'),
    body('destination').isString().notEmpty().withMessage('Destination is required'),
    body('flight').isObject().notEmpty().withMessage('Flight option is required'),
    body('hotel').isObject().notEmpty().withMessage('Hotel option is required'),
    body('numDays').isInt({ min: 1 }).withMessage('numDays must be a positive integer'),
    body('vibe').isString().notEmpty().withMessage('Vibe is required'),
    validateRequest
], generateItinerary);

export default router;
