import express from "express";
import heatlhCheckRouter from "./routes/heatlhCheck.route.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/health-check", heatlhCheckRouter);

export default app;
