import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Preferences } from '../models/Preferences';
import { User } from '../models/User';

export const getPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    let preferences = await Preferences.findOne({ firebaseUid });

    if (!preferences) {
      // Find the user to associate with the new preferences
      const user = await User.findOne({ firebaseUid });
      if (user) {
        preferences = await Preferences.create({
            firebaseUid,
            userId: user._id,
            preferredAirlines: [],
            interests: []
        });
      } else {
         res.status(404).json({ message: 'User not found' });
         return;
      }
    }

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: 'Server error fetching preferences' });
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const updateData = req.body;

    // Disallow updating immutable fields
    delete updateData.firebaseUid;
    delete updateData.userId;

    const preferences = await Preferences.findOneAndUpdate(
      { firebaseUid },
      { $set: updateData },
      { new: true, runValidators: true, upsert: true }
    );

    res.json(preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error updating preferences' });
  }
};
