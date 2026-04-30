import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    let user = await User.findOne({ firebaseUid });

    // If profile doesn't exist, create it (happens on first login)
    if (!user) {
        user = await User.create({
            firebaseUid,
            email: req.user?.email || '',
            name: 'Traveler', // Default name, should ideally be set during signup
            authProvider: 'email' // Simple default, can be determined from Firebase token info
        });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const updateData = req.body;

    // Disallow updating sensitive fields directly
    delete updateData.firebaseUid;
    delete updateData.email;
    delete updateData.authProvider;

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

export const uploadPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    
    if (!req.file) {
      res.status(400).json({ message: 'No image file provided' });
      return;
    }

    // req.file.path contains the Cloudinary URL when using multer-storage-cloudinary
    const photoUrl = req.file.path;

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { $set: { photoUrl } },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ photoUrl, user });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ message: 'Server error uploading photo' });
  }
};
