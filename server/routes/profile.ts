import { Router } from 'express';
import { getProfile, updateProfile, uploadPhoto } from '../controllers/profileController';
import { verifyToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { body } from 'express-validator';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();

// Set up Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'orbit_profiles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    } as any
});

const upload = multer({ storage });

// All profile routes are protected
router.use(verifyToken);

router.get('/', getProfile);

router.put('/', [
    body('name').optional().isString().trim(),
    body('homeCity').optional().isString().trim(),
    body('preferredCurrency').optional().isString().trim().isLength({ min: 3, max: 3 }),
    body('travelStyle').optional().isIn(['luxury', 'budget', 'backpacking', 'adventure', 'family']),
    body('favoriteDestinations').optional().isArray(),
    body('bio').optional().isString().trim(),
    validateRequest
], updateProfile);

router.post('/photo', upload.single('photo'), uploadPhoto);

export default router;
