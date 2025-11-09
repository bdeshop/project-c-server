import mongoose, { Document, Schema } from 'mongoose';

export interface ITopWinner extends Document {
  gameName: string;
  gameCategory: string;
  username: string;
  winAmount: number;
  currency: string;
  winTime: Date;
  gameImage?: string;
  multiplier?: number;
  isLive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TopWinnerSchema: Schema = new Schema({
  gameName: {
    type: String, // e.g., "Super Ace", "Fortune Gems 2"
    required: true,
  },
  gameCategory: {
    type: String, // e.g., "Slots", "Casino", "Crash", "Table", "Sports"
    required: true,
  },
  username: {
    type: String, // masked in frontend, store full or masked version
    required: true,
  },
  winAmount: {
    type: Number, // e.g., 2944.00
    required: true,
  },
  currency: {
    type: String, // e.g., "BDT", "$", "₹" etc.
    default: "BDT",
  },
  winTime: {
    type: Date, // when the win happened
    default: Date.now,
  },
  gameImage: {
    type: String, // URL/path to the game thumbnail image
  },
  multiplier: {
    type: Number, // e.g., 500x, 15x etc. (optional but useful)
  },
  isLive: {
    type: Boolean,
    default: true, // whether to show it in "LIVE" Top Winners
  }
}, { 
  timestamps: true 
});

export default mongoose.model<ITopWinner>('TopWinner', TopWinnerSchema);