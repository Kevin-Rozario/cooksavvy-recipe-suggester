import { GoogleGenAI, Type } from "@google/genai";
import { config } from "dotenv";
import { ApiError } from "./apiError.util.js";

config({
  path: ".env",
});

const gemAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const structuredOutputTemplate = {
  responseMimeType: "application/json",
  responseSchema: {
    type: "array",
    items: {
      type: "object",
      properties: {
        recipeImage: {
          type: "string",
          description: "URL of the recipe image",
        },
        recipeVideoUrl: {
          type: "string",
          description: "URL of the recipe video",
        },
        title: {
          type: "string",
          description: "Title of the recipe",
          nullable: false,
        },
        description: {
          type: "string",
          description: "Description of the recipe",
        },
        ratings: {
          type: "number",
          description: "Rating of the recipe (0-5)",
          nullable: false,
        },
        mealType: {
          type: "string",
          description: "Type of meal (e.g., dessert)",
        },
        cookTime: {
          type: "number",
          description: "Cook time in minutes",
          nullable: false,
        },
        difficultLevel: {
          type: "string",
          description: "Difficulty level (Easy, Medium, Hard)",
        },
        ingredients: {
          type: "array",
          items: {
            type: "object",
            properties: {
              ingredientName: { type: "string" },
              quantity: { type: "string" },
              ingredientImage: { type: "string" },
            },
          },
        },
        nutritions: {
          type: "object",
          properties: {
            energy: { type: "number" },
            carbs: { type: "number" },
            sugars: { type: "number" },
            dietaryFiber: { type: "number" },
            proteins: { type: "number" },
            fats: { type: "number" },
            saturatedFat: { type: "number" },
            transFat: { type: "number" },
            unsaturatedFat: { type: "number" },
            cholesterol: { type: "number" },
            sodium: { type: "number" },
            potassium: { type: "number" },
            calcium: { type: "number" },
            iron: { type: "number" },
            servingSize: { type: "number", nullable: false },
            vitamins: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  vitaminName: { type: "string" },
                  vitaminQuantity: { type: "string" },
                },
              },
            },
          },
        },
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              stepNumber: { type: "number", nullable: false },
              stepContent: { type: "string", nullable: false },
            },
          },
          nullable: false,
        },
        tags: {
          type: "array",
          items: {
            type: "string",
            description:
              "Tags associated with the recipe (e.g., gluten-free, keto, paleo, vegan)",
          },
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

const parseApiResponse = (response) => {
  if (
    !response.candidates ||
    response.candidates.length === 0 ||
    !response.candidates[0].content.parts ||
    response.candidates[0].content.parts.length === 0
  ) {
    throw new Error("Invalid API Response: Missing candidates or parts");
  }

  const rawResponse = response.candidates[0].content.parts[0].text;
  // console.log("Raw API Response:", rawResponse);

  try {
    return JSON.parse(rawResponse);
  } catch (error) {
    throw new Error("Invalid JSON in API Response");
  }
};

export const aiFetchRecipes = async () => {
  try {
    const response = await gemAi.models.generateContent({
      model: "gemini-2.0-flash",
      contents:
        "Provide 1 popular cookie recipe with all recipe, ingredient and nutrition details in JSON format.",
      config: structuredOutputTemplate,
    });
    return parseApiResponse(response);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }
};

export const aiFetchRecipesByIngredient = async (ingredient) => {
  try {
    const response = await gemAi.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Provide 1 popular healthy recipes that include "${ingredient}" as an ingredient, with all recipe, ingredient, and nutrition details in JSON format.`,
      config: structuredOutputTemplate,
    });
    return parseApiResponse(response);
  } catch (error) {
    console.error("Error fetching recipes by ingredient:", error);
    throw new ApiError(500, "Error fetching recipes by ingredient");
  }
};

export const aiFetchRecipesByDiet = async (diet) => {
  try {
    const response = await gemAi.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Provide 1 popular healthy recipes that fit the "${diet}" dietary restriction, with all recipe, ingredient, and nutrition details in JSON format.`,
      config: structuredOutputTemplate,
    });
    return parseApiResponse(response);
  } catch (error) {
    console.error("Error fetching recipes by diet:", error);
    throw new ApiError(500, "Error fetching recipes by diet");
  }
};
