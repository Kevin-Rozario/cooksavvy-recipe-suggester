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
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadProfileImage } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/login").post(loginUser);
router.route("/register").post(registerUser);
router.route("/verify").post(verifyUser);
router.route("/refresh-token").get(renewRefreshToken);
router
  .route("/profile")
  .get(authMiddleware, getProfile)
  .post(authMiddleware, uploadProfileImage, getProfile);
router.route("/logout").post(authMiddleware, logoutUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router
  .route("/favourites/:recipeId")
  .post(authMiddleware, addRecipeToFavourites)
  .delete(authMiddleware, removeRecipeFromFavourites);
router.route("/favourites").post(authMiddleware, getFavouriteRecipes);

export default router;
