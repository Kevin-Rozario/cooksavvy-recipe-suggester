import { Router } from "express";
import {
  addIngredientToCart,
  clearCart,
  fetchRecipes,
  getCart,
  removeIngredientFromCart,
  searchRecipeByDiet,
  searchRecipeByIngredient,
  updateCartItemQuantity,
} from "../controllers/recipe.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(fetchRecipes);
router.route("/:ingredient").get(searchRecipeByIngredient);
router.route("/diet/:diet").get(searchRecipeByDiet);
router.route("/cart/add").post(authMiddleware, addIngredientToCart);
router
  .route("/cart/remove/:ingredientName")
  .delete(authMiddleware, removeIngredientFromCart);
router
  .route("/cart/update/:ingredientName")
  .put(authMiddleware, updateCartItemQuantity);
router.route("/cart").get(authMiddleware, getCart);
router.route("/cart/clear").delete(authMiddleware, clearCart);

export default router;
