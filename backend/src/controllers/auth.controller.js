import { ApiResponse } from "../utils/apiResponse.util.js";
import { ApiError } from "../utils/apiError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import User from "../models/user.model.js";
import {
  emailVerificationMailGenContent,
  passwordResetMailGenContent,
  sendEmail,
} from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";

export const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, "Identifier and password are required!");
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { userName: identifier }],
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(401, "Email not verified");
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
    .json(
      new ApiResponse(200, { message: "User logged in successfully!" }, user),
    );
});

export const registerUser = asyncHandler(async (req, res) => {
  // get data
  const { email, userName, fullName, password, dietPreferences, allergies } =
    req.body;

  // validate data
  if (!email || !userName || !fullName || !password) {
    throw new ApiError(400, "All fields are required!");
  }

  console.log(`Email: ${email}\nPassword: ${password}`); // test purpose

  // Check for existing user by email or username
  const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
  if (existingUser) {
    throw new ApiError(409, "Email or username already exists");
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
    throw new ApiError(500, "Failed to register user");
  }

  // generate the token
  const { token, tokenExpiry } = createdUser.generateTemporaryToken();
  createdUser.emailToken = token;
  createdUser.emailTokenExpiry = tokenExpiry;
  await createdUser.save();

  // send email to user
  const options = {
    email: createdUser.email,
    subject: "Cooksavvy Verification Email",
    mailGenContent: emailVerificationMailGenContent({
      userName: createdUser.fullName,
      verificationUrl: `${process.env.BASE_URL}/api/v1/users/verify?tkey=${token}`,
    }),
  };

  const emailStatus = await sendEmail(options);
  if (!emailStatus) {
    console.error("Failed to send verification email", emailStatus);
    throw new ApiError(500, "Failed to send verification email.");
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

export const verifyUser = asyncHandler(async (req, res) => {
  // get the token from query
  const token = req.query.tkey;
  if (!token) {
    throw new ApiError(400, "Email verification token not found!");
  }

  // find user based on otp
  const user = await User.findOne({ emailToken: token });
  if (!user) {
    throw new ApiError(404, "Invalid email verification token!");
  }

  if (Date.now() > user.emailTokenExpiry) {
    user.emailToken = undefined;
    user.emailTokenExpiry = undefined;
    await user.save();
    throw new ApiError(400, "Email verification token expired!");
  }

  user.isEmailVerified = true;
  user.emailToken = undefined;
  user.emailTokenExpiry = undefined;
  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, { message: "User verified successfully!" }, user),
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  // get user id
  const userId = req.user?.userId;

  // check id
  if (!userId) {
    throw new ApiError(401, "Unauthorized: No user found in request!");
  }

  // fetch user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  // Clear refresh token from the database
  user.refreshToken = undefined;
  await user.save();

  // Clear cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  // Send response
  return res
    .status(200)
    .json(new ApiResponse(200, "User logged out successfully!", {}));
});

export const renewRefreshToken = asyncHandler(async (req, res) => {
  // get refresh token from cookies
  const { refreshToken } = req.cookies;

  // check for refresh token
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required!");
  }

  // decode token retrieve user info
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const userId = decoded?.userId;

    if (!userId) {
      throw new ApiError(401, "Invalid refresh token!");
    }

    // fetch user
    const user = await User.findById(userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(401, "Invalid or expired refresh token!");
    }

    // generate new tokens
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    // Save new refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save();

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    // Set new tokens in cookies and send response
    res
      .cookie("accessToken", newAccessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Access token renewed successfully!" },
          { accessToken: newAccessToken },
        ),
      );
  } catch (error) {
    console.error("Error during refresh token renewal:", error);
    throw new ApiError(401, "Invalid refresh token!");
  }
});

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new ApiError(401, "Unauthorised request");
  }

  const foundUser = await User.findOne({ _id: userId }).select(
    "-_id -password -refreshToken",
  );
  if (!foundUser) {
    throw new ApiError(404, "User not found!");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "User fetched succssfully!", foundUser));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  // get email from request
  const { email } = req.body;

  // check if email exists
  if (!email) {
    throw new ApiError(400, "Email is required!");
  }

  // check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json(
      new ApiResponse(200, {
        message:
          "If an account with this email exists, a password reset link has been sent.",
      }),
    );
  }

  // generate token
  const { token, tokenExpiry } = user.generateTemporaryToken();
  user.forgotPasswordToken = token;
  user.forgotPasswordTokenExpiry = tokenExpiry;
  await user.save();

  // mail options
  const options = {
    email: user.email,
    subject: "Cooksavvy Password Reset Email",
    mailGenContent: passwordResetMailGenContent({
      userName: user.fullName,
      verificationUrl: `${process.env.BASE_URL}/api/v1/auth/reset-password?tkey=${token}`,
    }),
  };

  // send email
  const emailStatus = await sendEmail(options);
  if (!emailStatus) {
    console.error("Failed to send password reset email", emailStatus);
    throw new ApiError(500, "Failed to send password reset email.");
  }

  // send response
  res.status(200).json(
    new ApiResponse(200, {
      message: "Password reset email sent successfully!",
    }),
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  // get token and password from request
  const { token, password } = req.body;

  // check if token and password exists
  if (!token || !password) {
    throw new ApiError(400, "Token and new password are required!");
  }

  // fetch user
  const user = await User.findOne({ forgotPasswordToken: token });
  if (!user) {
    throw new ApiError(400, "Invalid password reset token.");
  }

  // check token expiry
  if (Date.now() > user.forgotPasswordTokenExpiry) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    await user.save();
    throw new ApiError(400, "Password reset token has expired.");
  }

  // modify fields
  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;
  await user.save();

  // send response
  res
    .status(200)
    .json(new ApiResponse(200, { message: "Password reset successfully!" }));
});
