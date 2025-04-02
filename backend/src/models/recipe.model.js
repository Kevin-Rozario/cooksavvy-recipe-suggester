import mongoose, { Schema } from "mongoose";
import { difficultLevelEnum, difficultLevelList } from "../utils/constants";

const recipeSchema = new mongoose.Schema(
  {
    recipeImage: String,
    recipeVideoUrl: String,
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    ratings: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
    mealType: {
      type: String,
      trim: true,
    },
    cookTime: {
      type: Number,
      required: true,
    },
    difficultLevel: {
      type: String,
      enum: difficultLevelList,
      default: difficultLevelEnum.EASY,
    },
    nutritions: {
      type: Schema.Types.ObjectId,
      ref: "Nutrition",
    },
    steps: {
      type: [
        {
          stepNumber: {
            type: Number,
            required: true,
          },
          stepContent: {
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
    },
  },
  { timestamps: true },
);

export const Recipe = mongoose.model("Recipe", recipeSchema);
