import mongoose, { Schema, Document } from "mongoose";

export interface IGame extends Document {
  gameUuid: string;
  nameEnglish: string;
  nameBangla: string;
  image: string;
  provider?: mongoose.Types.ObjectId;
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
      required: [true, "Game UUID is required"],
      trim: true,
      unique: true,
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
    provider: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: false,
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

export default mongoose.model<IGame>("Game", gameSchema);
