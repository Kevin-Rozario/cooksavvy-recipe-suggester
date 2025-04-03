import { z } from "zod";

const loginSchema = z.object({
  userName: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(255, { message: "Username must not exceed 255 characters" }),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email format" })
    .max(255, { message: "Email must not exceed 255 characters" }),
  password: z
    .string({ required_error: "Password is required" })
    .trim()
    .min(12, { message: "Password must be at least 12 characters" })
    .max(1024, { message: "Password must not exceed 1024 characters" })
    .refine(
      (password) => {
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return hasUppercase && hasLowercase && hasNumbers && hasSymbols;
      },
      {
        message:
          "Password must contain uppercase, lowercase, numbers, and symbols",
      },
    ),
});

export { loginSchema };
