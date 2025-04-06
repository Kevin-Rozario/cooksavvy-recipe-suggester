import { Router } from "express";

// * Zod validation is in progress
// import { validate } from "../middlewares/validate.middleware.js";
// import { loginSchema } from "../validators/login.validator.js";
// import { registerSchema } from "../validators/register.validator.js";

import {
  addRecipeToFavourites,
  forgotPassword,
  getFavouriteRecipes,
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
  removeRecipeFromFavourites,
  renewRefreshToken,
  resetPassword,
  verifyUser,
} from "../controllers/auth.controller.js";
import { authMiddlware } from "../middlewares/auth.middleware.js";
import { uploadProfileImage } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/login").post(loginUser);
router.route("/register").post(registerUser);
router.route("/verify").post(verifyUser);
router.route("/refresh-token").get(renewRefreshToken);
router
  .route("/profile")
  .get(authMiddlware, getProfile)
  .post(authMiddlware, uploadProfileImage, getProfile);
router.route("/logout").post(authMiddlware, logoutUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router
  .route("/favourites/add/:recipeId")
  .post(authMiddlware, addRecipeToFavourites);
router
  .route("/favourites/rm/:recipeId")
  .post(authMiddlware, removeRecipeFromFavourites);
router.route("/favourites").post(authMiddlware, getFavouriteRecipes);

export default router;
