import { ApiResponse } from "../utils/apiResponse.util.js";
import {
  aiFetchRecipes,
  aiFetchRecipesByIngredient,
} from "../utils/gemAi.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";

export const fetchRecipes = async (_req, res) => {
  const allRecipes = await aiFetchRecipes();
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { message: "Recipes fetched succussfully!" },
        allRecipes,
      ),
    );
};

export const searchRecipeByIngredient = asyncHandler(async (req, res) => {
  const { ingredient } = req.params;
  if (!ingredient)
    return new ApiError(400, { message: "Ingredient not found!" }, {});
  const allRecipes = await aiFetchRecipesByIngredient(ingredient);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { message: "Recipes fetched succussfully!" },
        allRecipes,
      ),
    );
});
