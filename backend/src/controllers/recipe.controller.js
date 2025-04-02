import { ApiResponse } from "../utils/apiResponse.util.js";
import {
  aiFetchRecipes,
  aiFetchRecipesByDiet,
  aiFetchRecipesByIngredient,
} from "../utils/gemAi.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";

export const fetchRecipes = async (_req, res) => {
  try {
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
  } catch (error) {
    console.error("Error fetching all recipes:", error);
    throw new ApiError(500, { message: "Failed to fetch recipes." }, {});
  }
};

export const searchRecipeByIngredient = asyncHandler(async (req, res) => {
  const { ingredient } = req.params;
  if (
    !ingredient ||
    typeof ingredient !== "string" ||
    ingredient.trim() === ""
  ) {
    throw new ApiError(400, { message: "Ingredient not found!" }, {});
  }
  try {
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
  } catch (error) {
    console.error(
      `Error fetching recipes by ingredient '${ingredient}':`,
      error,
    );
    throw new ApiError(
      500,
      { message: "Failed to fetch recipes for the given ingredient." },
      {},
    );
  }
});

export const searchRecipeByDiet = asyncHandler(async (req, res) => {
  const { diet } = req.params;
  if (!diet || typeof diet !== "string" || diet.trim() === "") {
    throw new ApiError(400, { message: "Diet not found!" }, {});
  }
  try {
    const allRecipes = await aiFetchRecipesByDiet(diet);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Recipes fetched successfully!" },
          allRecipes,
        ),
      );
  } catch (error) {
    console.error(`Error fetching recipes by diet '${diet}':`, error);
    throw new ApiError(
      500,
      { message: "Failed to fetch recipes for the given diet." },
      {},
    );
  }
});
