import mongoose, { Document, Schema } from 'mongoose';

export interface IUpcomingMatch extends Document {
  matchType: string;
  matchDate: Date;
  teamA: {
    name: string;
    flagImage?: string;
    odds: number;
  };
  teamB: {
    name: string;
    flagImage?: string;
    odds: number;
  };
  isLive: boolean;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const UpcomingMatchSchema: Schema = new Schema({
  matchType: {
    type: String, // e.g., "Womens OD", "T20", "Test", "Football"
    required: true,
  },
  matchDate: {
    type: Date, // e.g., 2025-09-30T15:30:00
    required: true,
  },
  teamA: {
    name: { type: String, required: true }, // e.g., "India W"
    flagImage: { type: String },            // URL/path for flag image
    odds: { type: Number, required: true }, // e.g., 2.34
  },
  teamB: {
    name: { type: String, required: true }, // e.g., "Sri Lanka W"
    flagImage: { type: String },
    odds: { type: Number, required: true }, // e.g., 3.44
  },
  isLive: {
    type: Boolean,
    default: false, // when match starts, set true
  },
  category: {
    type: String, // e.g., "Cricket", "Football"
    required: true,
  }
}, { timestamps: true });

export default mongoose.model<IUpcomingMatch>('UpcomingMatch', UpcomingMatchSchema);