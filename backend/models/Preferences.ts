import mongoose, { Document, Schema } from 'mongoose';

export interface IPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  firebaseUid: string;
  preferredAirlines: string[];
  hotelStarRating?: number;
  seatPreference?: 'window' | 'aisle' | 'middle';
  mealPreference?: 'veg' | 'non-veg' | 'vegan';
  interests: string[];
  budgetRange?: {
    min: number;
    max: number;
    currency: string;
  };
  travelerType?: 'solo' | 'couple' | 'family';
  updatedAt: Date;
}

const preferencesSchema = new Schema<IPreferences>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    firebaseUid: { type: String, required: true, unique: true },
    preferredAirlines: [{ type: String }],
    hotelStarRating: { type: Number, min: 1, max: 5 },
    seatPreference: { type: String, enum: ['window', 'aisle', 'middle'] },
    mealPreference: { type: String, enum: ['veg', 'non-veg', 'vegan'] },
    interests: [{ type: String }],
    budgetRange: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' }
    },
    travelerType: { type: String, enum: ['solo', 'couple', 'family'] }
  },
  { timestamps: true }
);

export const Preferences = mongoose.model<IPreferences>('Preferences', preferencesSchema);
