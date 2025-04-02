import { Router } from "express";
import {
  fetchRecipes,
  searchRecipeByDiet,
  searchRecipeByIngredient,
} from "../controllers/recipe.controller.js";

const router = Router();

router.route("/").get(fetchRecipes);
router.route("/:ingredient").get(searchRecipeByIngredient);
router.route("/diet/:diet").get(searchRecipeByDiet);

export default router;
