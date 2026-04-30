import mongoose, { Document, Schema } from 'mongoose';

export interface ITrip extends Document {
  userId: mongoose.Types.ObjectId;
  firebaseUid: string;
  destination: string;
  origin: string;
  dates: string;
  itineraryJson: Record<string, any>;
  selectedFlight?: Record<string, any>;
  selectedHotel?: Record<string, any>;
  isFavorite: boolean;
  isSaved: boolean;
  status: 'generated' | 'booked' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const tripSchema = new Schema<ITrip>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    firebaseUid: { type: String, required: true },
    destination: { type: String, required: true },
    origin: { type: String, required: true },
    dates: { type: String, required: true },
    itineraryJson: { type: Schema.Types.Mixed, required: true },
    selectedFlight: { type: Schema.Types.Mixed },
    selectedHotel: { type: Schema.Types.Mixed },
    isFavorite: { type: Boolean, default: false },
    isSaved: { type: Boolean, default: true },
    status: { type: String, enum: ['generated', 'booked', 'completed'], default: 'generated' },
  },
  { timestamps: true }
);

export const Trip = mongoose.model<ITrip>('Trip', tripSchema);
