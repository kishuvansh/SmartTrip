import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  name: string;
  email: string;
  authProvider: 'email' | 'google';
  photoUrl?: string;
  homeCity?: string;
  preferredCurrency?: string;
  travelStyle?: 'luxury' | 'budget' | 'backpacking' | 'adventure' | 'family';
  favoriteDestinations?: string[];
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    authProvider: { type: String, enum: ['email', 'google'], required: true },
    photoUrl: { type: String },
    homeCity: { type: String },
    preferredCurrency: { type: String, default: 'USD' },
    travelStyle: { 
        type: String, 
        enum: ['luxury', 'budget', 'backpacking', 'adventure', 'family'] 
    },
    favoriteDestinations: [{ type: String }],
    bio: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
