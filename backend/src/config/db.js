import mongoose from "mongoose";
import { config } from "dotenv";

config({
  path: ".env",
});

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Failed to connect to MongoDB.", error);
    process.exit(1);
  }
};

export default dbConnect;
