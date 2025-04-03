import { z } from "zod";
import { allergiesList, dietList } from "../utils/constants.js";

const registerSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, {
      message: "Username must be at least 3 chars",
    })
    .max(255, { message: "Username must not be more than 255 chars long" })
    .optional(),
  fullName: z
    .string({ required_error: "Fullname is required" })
    .trim()
    .min(3, {
      message: "Fullname must be at least 3 chars",
    })
    .max(255, { message: "Fullname must not be more than 255 chars long" })
    .optional(),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(3, {
      message: "Email must be at least 3 chars",
    })
    .max(255, { message: "Email must not be more than 255 chars long" })
    .email({ message: "Invalid email format" }),
  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(3, {
      message: "Password must be at least 6 chars",
    })
    .max(255, { message: "Password must not be more than 1024 chars long" }),
  dietPreferences: z.string().enum(dietList),
  allergies: z.string().enum(allergiesList),
});

export { registerSchema };
