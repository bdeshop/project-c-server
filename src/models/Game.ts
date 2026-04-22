import mongoose, { Schema, Document } from "mongoose";

export interface IGame extends Document {
  gameUuid?: string;
  gameId: string; // Oracle API game ID
  gameCode?: string; // Oracle API game_code
  gameName?: string; // Oracle API gameName
  nameEnglish: string;
  nameBangla: string;
  image: string;
  gameType?: string; // Oracle API game_type (SPORTS, SLOT, etc.)
  jackpot?: string; // Oracle API jackpot (TRUE/FALSE)
  freeTry?: string; // Oracle API freeTry (TRUE/FALSE)
  rtp?: number; // Oracle API RTP
  provider?: mongoose.Types.ObjectId;
  providerCode?: string; // Oracle API provider_code
  providerName?: string; // Oracle API providerName
  category: mongoose.Types.ObjectId;
  isHot: boolean;
  isNewGame: boolean;
  isLobby: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gameSchema = new Schema<IGame>(
  {
    gameUuid: {
      type: String,
      trim: true,
      sparse: true,
    },
    gameId: {
      type: String,
      required: [true, "Game ID is required"],
      trim: true,
    },
    gameCode: {
      type: String,
      trim: true,
    },
    gameName: {
      type: String,
      trim: true,
    },
    nameEnglish: {
      type: String,
      required: [true, "Game name in English is required"],
      trim: true,
    },
    nameBangla: {
      type: String,
      required: [true, "Game name in Bangla is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Game image is required"],
    },
    gameType: {
      type: String,
      trim: true,
    },
    jackpot: {
      type: String,
      trim: true,
    },
    freeTry: {
      type: String,
      trim: true,
    },
    rtp: {
      type: Number,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: false,
    },
    providerCode: {
      type: String,
      trim: true,
    },
    providerName: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "GameCategory",
      required: [true, "Game category is required"],
    },
    isHot: {
      type: Boolean,
      default: false,
    },
    isNewGame: {
      type: Boolean,
      default: false,
    },
    isLobby: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound unique index: same gameId can't exist twice for same provider
gameSchema.index({ provider: 1, gameId: 1 }, { unique: true, sparse: true });

export default mongoose.model<IGame>("Game", gameSchema);

