import { ApiResponse } from "../utils/apiResponse.util.js";
import { ApiError } from "../utils/apiError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { User } from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";

export const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, {
      message: "Identifier and password are required!",
    });
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { userName: identifier }],
  });

  if (!user) {
    throw new ApiError(401, { message: "Invalid credentials" }); // More generic message
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, { message: "Invalid credentials" });
  }

  if (!user.isVerified) {
    throw new ApiError(401, { message: "Email not verified." });
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };

  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .status(200)
    .json(new ApiResponse(200, { message: "User logged in successfully!" }));
});

export const registerUser = asyncHandler(async (req, res) => {
  // get data
  const { email, userName, fullName, password, dietPreferences, allergies } =
    req.body;

  // validate data
  if (!email || !userName || !fullName || !password) {
    throw new ApiError(400, { message: "All fields are required!" });
  }

  // Check for existing user by email or username
  const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
  if (existingUser) {
    throw new ApiError(409, { message: "Email or username already exists" });
  }

  // create the user
  const createdUser = await User.create({
    email,
    userName,
    fullName,
    password,
    dietPreferences,
    allergies,
  });

  if (!createdUser) {
    throw new ApiError(500, { message: "Failed to register user" });
  }

  // generate the otp
  const { otp, hashedOtp, otpExpiry } =
    await createdUser.generateTemporaryOtp();
  createdUser.otp = hashedOtp;
  createdUser.otpExpiry = otpExpiry;
  await createdUser.save();

  // send email to user
  const emailStatus = await sendEmail(createdUser, otp);
  if (!emailStatus) {
    console.error("Failed to send verification email", emailStatus);
    throw new ApiError(500, { message: "Failed to send verification email." });
  }

  // send response
  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { message: "User registered successfully!" },
        createdUser,
      ),
    );
});
