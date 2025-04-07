import express from "express";
import heatlhCheckRouter from "./routes/heatlhCheck.route.js";
import authRoutes from "./routes/auth.routes.js";
import recipeRouter from "./routes/recipe.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization"],
};

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// Routes
app.use("/api/v1/health-check", heatlhCheckRouter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/recipes", recipeRouter);

export default app;
