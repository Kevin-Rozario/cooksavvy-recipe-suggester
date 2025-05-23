import { Router } from "express";
import {
  addIngredientToCart,
  clearCart,
  fetchRecipes,
  getCart,
  removeIngredientFromCart,
  searchRecipeByDiet,
  searchRecipeByImage,
  searchRecipeByIngredient,
  searchRecipeByList,
  searchRecipeByLocation,
  searchRecipeByManualList,
  updateCartItemQuantity,
} from "../controllers/recipe.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadGeneralImage } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(fetchRecipes);

router.route("/:ingredient").get(searchRecipeByIngredient);

router.route("/diet/:diet").get(searchRecipeByDiet);

router
  .route("/ingredients/upload-image")
  .post(authMiddleware, uploadGeneralImage, searchRecipeByImage);
router
  .route("/ingredients/upload-list")
  .post(authMiddleware, uploadGeneralImage, searchRecipeByList);

router
  .route("/ingredients/upload-manual-list")
  .post(authMiddleware, searchRecipeByManualList);

router.route("/:location").get(authMiddleware, searchRecipeByLocation);

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
