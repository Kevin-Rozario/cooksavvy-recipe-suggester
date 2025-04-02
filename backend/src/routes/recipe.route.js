import { Router } from "express";
import { fetchRecipes, searchRecipeByIngredient } from "../controllers/recipe.controller.js";

const router = Router();

router.route("/").get(fetchRecipes);
router.route("/:ingredient").get(searchRecipeByIngredient)

export default router;
