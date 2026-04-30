import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Trip } from '../models/Trip';
import { User } from '../models/User';

export const getTrips = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const trips = await Trip.find({ firebaseUid }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Server error fetching trips' });
  }
};

export const createTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.user?.uid;
    const user = await User.findOne({ firebaseUid });
    
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }

    const { destination, origin, dates, itineraryJson, selectedFlight, selectedHotel } = req.body;

    const newTrip = await Trip.create({
      userId: user._id,
      firebaseUid,
      destination,
      origin,
      dates,
      itineraryJson,
      selectedFlight,
      selectedHotel
    });

    res.status(201).json(newTrip);
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ message: 'Server error creating trip' });
  }
};

export const getTripById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const firebaseUid = req.user?.uid;
        const trip = await Trip.findOne({ _id: req.params.id, firebaseUid });
        
        if (!trip) {
            res.status(404).json({ message: 'Trip not found' });
            return;
        }

        res.json(trip);
    } catch (error) {
        console.error('Error fetching trip:', error);
        res.status(500).json({ message: 'Server error fetching trip' });
    }
};

export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const firebaseUid = req.user?.uid;
        const trip = await Trip.findOne({ _id: req.params.id, firebaseUid });
        
        if (!trip) {
            res.status(404).json({ message: 'Trip not found' });
            return;
        }

        trip.isFavorite = !trip.isFavorite;
        await trip.save();

        res.json(trip);
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ message: 'Server error toggling favorite' });
    }
};

export const deleteTrip = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const firebaseUid = req.user?.uid;
        const trip = await Trip.findOneAndDelete({ _id: req.params.id, firebaseUid });
        
        if (!trip) {
            res.status(404).json({ message: 'Trip not found' });
            return;
        }

        res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
        console.error('Error deleting trip:', error);
        res.status(500).json({ message: 'Server error deleting trip' });
    }
};
