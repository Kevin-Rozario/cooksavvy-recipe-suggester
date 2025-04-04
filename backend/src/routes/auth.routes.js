import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validators/login.validator.js";
import { loginUser, registerUser, verifyUser } from "../controllers/auth.controller.js";
import { registerSchema } from "../validators/register.validator.js";

const router = Router();

router.route("/login").post(validate(loginSchema), loginUser);
router.route("/register").post(validate(registerSchema), registerUser);
router.route("/verify").post(verifyUser);

export default router;
