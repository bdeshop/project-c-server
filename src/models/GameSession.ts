import mongoose, { Schema, Document } from "mongoose";

export interface IGameSession extends Document {
  userId: mongoose.Types.ObjectId;
  originalUsername: string;
  gameProviderUsername: string;
  gameProviderAccountId?: string;
  gameUuid: string;
  gameCode?: string;
  providerCode?: string;
  createdAt: Date;
  expiresAt: Date;
}

const gameSessionSchema = new Schema<IGameSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalUsername: {
      type: String,
      required: true,
    },
    gameProviderUsername: {
      type: String,
      required: true,
      unique: true,
    },
    gameProviderAccountId: {
      type: String,
      required: false,
      index: true,
    },
    gameUuid: {
      type: String,
      required: true,
    },
    gameCode: {
      type: String,
      required: false,
    },
    providerCode: {
      type: String,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: false,
  },
);

export default mongoose.model<IGameSession>("GameSession", gameSessionSchema);
