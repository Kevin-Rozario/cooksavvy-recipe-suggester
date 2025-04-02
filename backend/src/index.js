import { config } from "dotenv";
import dbConnect from "./db/dbConnect.js";
import app from "./app.js";

config({
  path: ".env",
});
const PORT = process.env.PORT || 4000;

dbConnect().then(() => {
  app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
});
