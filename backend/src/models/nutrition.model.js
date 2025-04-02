import mongoose from "mongoose";

const nutritionSchema = new mongoose.Schema(
  {
    energy: {
      type: Number,
    },
    carbs: {
      type: Number,
    },
    sugars: {
      type: Number,
    },
    dietaryFiber: {
      type: Number,
    },
    proteins: {
      type: Number,
    },
    fats: {
      type: Number,
    },
    saturatedFat: {
      type: Number,
    },
    transFat: {
      type: Number,
    },
    unsaturatedFat: {
      type: Number,
    },
    cholesterol: {
      type: Number,
    },
    sodium: {
      type: Number,
    },
    potassium: {
      type: Number,
    },
    calcium: {
      type: Number,
    },
    iron: {
      type: Number,
    },
    servingSize: {
      type: Number,
      required: true,
    },
    vitamins: [
      {
        vitaminName: { type: String, trim: true },
        vitaminQuantity: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true },
);

export const Nutrition = mongoose.model("Nutrition", nutritionSchema);
