import mongoose, { Schema } from "mongoose";
import { difficultLevelEnum, difficultLevelList } from "../utils/constants.js";

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
    ingredients: {
      type: [
        {
          name: {
            type: String,
            trim: true,
          },
          quatity: {
            type: Number,
          },
        },
      ],
      default: [],
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
    tags: {
      type: [
        {
          description: {
            type: String,
            lowercase: true,
            trim: true,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
