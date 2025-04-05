import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validators/login.validator.js";
import { registerSchema } from "../validators/register.validator.js";
import {
  getProfile,
  loginUser,
  logoutUser,
  registerUser,
  renewRefreshToken,
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
router.route("/logout").get(authMiddlware, logoutUser);

export default router;
