import express from "express";
import heatlhCheckRouter from "./routes/heatlhCheck.route.js";
import authRoutes from "./routes/auth.routes.js";
import recipeRouter from "./routes/recipe.route.js";
import cookieParser from "cookie-parser";

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1/health-check", heatlhCheckRouter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/recipes", recipeRouter);

export default app;
