import { GoogleGenAI, Type } from "@google/genai";
import { config } from "dotenv";

config({
  path: ".env",
});

const gemAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const structuredOutputTemplate = {
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        recipeImage: {
          type: Type.STRING,
          description: "URL of the recipe image",
        },
        recipeVideoUrl: {
          type: Type.STRING,
          description: "URL of the recipe video",
        },
        title: {
          type: Type.STRING,
          description: "Title of the recipe",
          nullable: false,
        },
        description: {
          type: Type.STRING,
          description: "Description of the recipe",
        },
        ratings: {
          type: Type.NUMBER,
          description: "Rating of the recipe (0-5)",
          nullable: false,
        },
        mealType: {
          type: Type.STRING,
          description: "Type of meal (e.g., dessert)",
        },
        cookTime: {
          type: Type.NUMBER,
          description: "Cook time in minutes",
          nullable: false,
        },
        difficultLevel: {
          type: Type.STRING,
          description: "Difficulty level (Easy, Medium, Hard)",
        },
        ingredients: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ingredientName: { type: Type.STRING },
              quantity: { type: Type.STRING },
              ingredientImage: { type: Type.STRING },
            },
          },
          nullable: false,
        },
        nutritions: {
          type: Type.OBJECT,
          properties: {
            energy: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            sugars: { type: Type.NUMBER },
            dietaryFiber: { type: Type.NUMBER },
            proteins: { type: Type.NUMBER },
            fats: { type: Type.NUMBER },
            saturatedFat: { type: Type.NUMBER },
            transFat: { type: Type.NUMBER },
            unsaturatedFat: { type: Type.NUMBER },
            cholesterol: { type: Type.NUMBER },
            sodium: { type: Type.NUMBER },
            potassium: { type: Type.NUMBER },
            calcium: { type: Type.NUMBER },
            iron: { type: Type.NUMBER },
            servingSize: { type: Type.NUMBER, nullable: false },
            vitamins: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  vitaminName: { type: Type.STRING },
                  vitaminQuantity: { type: Type.STRING },
                },
              },
            },
          },
        },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stepNumber: { type: Type.NUMBER, nullable: false },
              stepContent: { type: Type.STRING, nullable: false },
            },
          },
          nullable: false,
        },
      },
      required: [
        "title",
        "ratings",
        "cookTime",
        "steps",
        "nutritions",
        "ingredients",
      ],
    },
  },
};

export const aiFetchRecipes = async () => {
  try {
    const response = await gemAi.models.generateContent({
      model: "gemini-1.5-pro",
      contents:
        "Provide 1 popular cookie recipe with all recipe, ingredient and nutrition details in JSON format.",
      config: structuredOutputTemplate,
    });
    const recipes = response.candidates[0].content.parts[0].text;
    // console.log(recipes);
    return JSON.parse(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return null;
  }
};

export const aiFetchRecipesByIngredient = async (ingredient) => {
  try {
    const response = await gemAi.models.generateContent({
      model: "gemini-1.5-pro",
      contents: `Provide 1 popular healthy recipes that include "${ingredient}" as an ingredient, with all recipe, ingredient, and nutrition details in JSON format.`,
      config: structuredOutputTemplate,
    });

    const recipes = response.candidates[0].content.parts[0].text;
    return JSON.parse(recipes);
  } catch (error) {
    console.error("Error fetching recipes by ingredient:", error);
    return null;
  }
};
