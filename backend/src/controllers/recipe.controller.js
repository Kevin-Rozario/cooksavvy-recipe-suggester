import { ApiResponse } from "../utils/apiResponse.util.js";
import {
  aiFetchRecipes,
  aiFetchRecipesByDiet,
  aiFetchRecipesByIngredient,
} from "../utils/gemAi.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/apiError.util.js";
import User from "../models/user.model.js";

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

export const addIngredientToCart = asyncHandler(async (req, res) => {
  const { ingredientName, quantity = 1 } = req.body;
  const userId = req.user.userId;

  if (
    !ingredientName ||
    typeof ingredientName !== "string" ||
    ingredientName.trim() === ""
  ) {
    throw new ApiError(400, "Ingredient name is required");
  }

  if (typeof quantity !== "number" || quantity < 1) {
    throw new ApiError(400, "Quantity must be a number greater than 0");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const ingredientExistsInCartIndex = user.cart.findIndex(
    (item) => item.ingredientName === ingredientName.trim(),
  );

  if (ingredientExistsInCartIndex > -1) {
    // Ingredient already exists, update the quantity
    user.cart[ingredientExistsInCartIndex].quantity += quantity;
  } else {
    // Ingredient doesn't exist, add it to the cart
    user.cart.push({ ingredientName: ingredientName.trim(), quantity });
  }

  await user.save();

  return res.status(200).json({
    message: "Ingredient added to cart successfully",
    cart: user.cart,
  });
});

export const removeIngredientFromCart = asyncHandler(async (req, res) => {
  const { ingredientName } = req.params;
  const userId = req.user.userId;

  if (
    !ingredientName ||
    typeof ingredientName !== "string" ||
    ingredientName.trim() === ""
  ) {
    throw new ApiError(400, "Ingredient name is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const initialCartLength = user.cart.length;

  user.cart = user.cart.filter(
    (item) => item.ingredientName !== ingredientName.trim(),
  );

  if (user.cart.length === initialCartLength) {
    return res.status(404).json({ message: "Ingredient not found in cart" });
  }

  await user.save();

  return res.status(200).json({
    message: "Ingredient removed from cart successfully",
    cart: user.cart,
  });
});

export const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { ingredientName } = req.params;
  const { quantity } = req.body;
  const userId = req.user.userId;

  if (
    !ingredientName ||
    typeof ingredientName !== "string" ||
    ingredientName.trim() === ""
  ) {
    throw new ApiError(400, "Ingredient name is required");
  }

  if (typeof quantity !== "number" || quantity < 1) {
    throw new ApiError(400, "Quantity must be a number greater than 0");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const ingredientIndex = user.cart.findIndex(
    (item) => item.ingredientName === ingredientName.trim(),
  );

  if (ingredientIndex === -1) {
    return res.status(404).json({ message: "Ingredient not found in cart" });
  }

  user.cart[ingredientIndex].quantity = quantity;
  await user.save();

  return res.status(200).json({
    message: "Cart item quantity updated successfully",
    cart: user.cart,
  });
});

export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const user = await User.findById(userId).select("cart");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json({ cart: user.cart });
});

export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const user = await User.findByIdAndUpdate(
    userId,
    { cart: [] },
    { new: true },
  ).select("cart");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json({ message: "Cart cleared successfully", cart: user.cart });
});
