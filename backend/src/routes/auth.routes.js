import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validators/login.validator.js";
import { loginUser } from "../controllers/auth.controller.js";

const router = Router();

router.route("/login").post(validate(loginSchema), loginUser);

export default router;
