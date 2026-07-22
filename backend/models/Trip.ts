import mongoose, { Document, Schema } from 'mongoose';

export interface ITrip extends Document {
  userId: mongoose.Types.ObjectId;
  firebaseUid: string;
  destination?: string;
  origin?: string;
  dates?: string;
  itineraryJson?: Record<string, any>;
  selectedFlight?: Record<string, any>;
  selectedHotel?: Record<string, any>;
  isFavorite: boolean;
  isSaved: boolean;
  status: 'active' | 'generated' | 'booked' | 'completed';
  chatHistory?: Array<{ role: string; content: string; timestamp?: string }>;
  vibe?: string;
  flightOptions?: Record<string, any>[];
  hotelOptions?: Record<string, any>[];
  currentDay?: number;
  createdAt: Date;
  updatedAt: Date;
}

const tripSchema = new Schema<ITrip>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    firebaseUid: { type: String, required: true },
    destination: { type: String },
    origin: { type: String },
    dates: { type: String },
    itineraryJson: { type: Schema.Types.Mixed },
    selectedFlight: { type: Schema.Types.Mixed },
    selectedHotel: { type: Schema.Types.Mixed },
    isFavorite: { type: Boolean, default: false },
    isSaved: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'generated', 'booked', 'completed'], default: 'active' },
    chatHistory: [{ role: String, content: String, timestamp: String }],
    vibe: { type: String },
    flightOptions: { type: Schema.Types.Mixed },
    hotelOptions: { type: Schema.Types.Mixed },
    currentDay: { type: Number, default: 1 },
  },
  { timestamps: true }
);

tripSchema.index({ firebaseUid: 1, status: 1 });

export const Trip = mongoose.model<ITrip>('Trip', tripSchema);
