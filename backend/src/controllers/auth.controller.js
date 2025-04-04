import { ApiResponse } from "../utils/apiResponse.util.js";
import { ApiError } from "../utils/apiError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import { User } from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";

export const loginUser = asyncHandler(async (req, res) => {
  // get data from request
  const { email, userName, password } = req.body;

  // validate data
  if (!email || !userName || !password) {
    throw new ApiError(400, { message: "All fields required!" });
  }

  // check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, { message: "User doesn't exists!" });
  }

  // check password correct
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, { message: "Invalid password!" });
  }

  // check if user is verified
  if (!user.isVerified) {
    throw new ApiError(401, { message: "Email not verified." });
  }

  // generate access and refresh tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // set tokens as cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: "Strict",
  };

  // send success response
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

  // get the email token
  const { otp, hashedOtp, otpExpiry } =
    await createdUser.generateTemporaryOtp();

  // send email to user
  const emailStatus = await sendEmail(createdUser, otp);
  if (!emailStatus) {
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
