import mongoose, { Schema, Document } from "mongoose";

export interface IGameSession extends Document {
  username: string;
  provider_code: string;
  game_code: string;
  status: "active" | "completed" | "refunded";
  lastTransactionId?: string;
  totalBet: number;
  totalWin: number;
  createdAt: Date;
  updatedAt: Date;
}

const gameSessionSchema = new Schema<IGameSession>(
  {
    username: {
      type: String,
      required: true,
      index: true,
    },
    provider_code: {
      type: String,
      required: true,
    },
    game_code: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "refunded"],
      default: "active",
    },
    lastTransactionId: {
      type: String,
    },
    totalBet: {
      type: Number,
      default: 0,
    },
    totalWin: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IGameSession>("GameSession", gameSessionSchema);
