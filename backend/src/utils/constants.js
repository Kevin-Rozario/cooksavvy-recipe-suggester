export const allergiesEnum = {
  GLUTEN: "gluten",
  DAIRY: "dairy",
  EGGS: "eggs",
  SOY: "soy",
  WHEAT: "wheat",
  FISH: "fish",
  SHELLFISH: "shellfish",
  TREE_NUTS: "tree-nuts",
  PEANUTS: "peanuts",
};

export const allergiesList = Object.values(allergiesEnum);

export const dietEnum = {
  VEGETARIAN: "vegetarian",
  VEGAN: "vegan",
  PALEO: "paleo",
  HIGH_FIBER: "high-fiber",
  HIGH_PROTEIN: "high-protein",
  LOW_CARB: "low-carb",
  LOW_FAT: "low-fat",
  LOW_SODIUM: "low-sodium",
  LOW_SUGAR: "low-sugar",
  ALCOHOL_FREE: "alcohol-free",
  IMMUNITY: "immunity",
  BALANCED: "balanced",
};

export const dietList = Object.values(dietEnum);

export const difficultLevelEnum = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

export const difficultLevelList = Object.values(difficultLevelEnum);

const recipeSchema = {
  recipeImage: String,
  recipeVideoUrl: String,
  title: String,
  description: String,
  ratings: Number,
  mealType: String,
  cookTime: String,
  difficultLevel: String,
  nutritions: {
    energy: String,
    carbs: String,
    sugars: String,
    dietaryFiber: String,
    proteins: String,
    fats: String,
    saturatedFat: String,
    transFat: String,
    unsaturatedFat: String,
    cholesterol: String,
    sodium: String,
    potassium: String,
    calcium: String,
    iron: String,
    servingSize: String,
    vitamins: {
      A: Number,
      B: Number,
      C: Number,
      D: Number,
      E: Number,
    },
  },
  steps: [
    {
      stepNumber: Number,
      stepContent: String,
    },
  ],
};
