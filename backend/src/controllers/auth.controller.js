import { ApiResponse } from "../utils/apiResponse.util.js";
import { ApiError } from "../utils/apiError.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";
import User from "../models/user.model.js";
import Recipe from "../models/recipe.model.js";
import {
  emailVerificationMailGenContent,
  passwordResetMailGenContent,
  sendEmail,
} from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Nutrition } from "../models/nutrition.model.js";

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

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required to resend verification link.");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User with this email not found.");
  }

  if (user.isEmailVerified) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { message: "This email is already verified." }),
      );
  }

  // Generate a new verification token and expiry
  const { token, tokenExpiry } = user.generateTemporaryToken();
  user.emailToken = token;
  user.emailTokenExpiry = tokenExpiry;
  await user.save();

  // Send the verification email
  const options = {
    email: user.email,
    subject: "Resend: Cooksavvy Verification Email",
    mailGenContent: emailVerificationMailGenContent({
      userName: user.fullName,
      verificationUrl: `${process.env.BASE_URL}/api/v1/auth/verify?tkey=${token}`,
    }),
  };

  const emailStatus = await sendEmail(options);
  if (!emailStatus) {
    console.error("Failed to resend verification email", emailStatus);
    return res.status(500).json(
      new ApiResponse(500, {
        message: "Failed to resend verification email. Please try again later.",
      }),
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, {
        message:
          "Verification email resent successfully. Please check your inbox.",
      }),
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

export const updateProfile = asyncHandler(async (req, res) => {
  // get data from request
  const { userId } = req.user;
  const { fullName, userName, email, dietPreferences, allergies } = req.body;

  if (!userId) {
    throw new ApiError(401, "Unauthorised request.");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  // check fullname
  if (fullName) {
    user.fullName = fullName.trim();
  }

  // check username
  if (userName) {
    const trimmedUsername = userName.trim().toLowerCase();
    if (trimmedUsername !== user.userName) {
      const existingUserWithUsername = await User.findOne({
        userName: trimmedUsername,
      });
      if (existingUserWithUsername) {
        throw new ApiError(409, "Username already exists!");
      }
      user.userName = trimmedUsername;
    }
  }

  // check email
  if (email) {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail !== user.email) {
      const existingUserWithEmail = await User.findOne({ email: trimmedEmail });
      if (existingUserWithEmail) {
        throw new ApiError(409, "Email already exists!");
      }
      user.email = trimmedEmail;
      user.isEmailVerified = false;
      const options = {
        email: user.email,
        subject: "Cooksavvy Verification Email",
        mailGenContent: emailVerificationMailGenContent({
          userName: user.fullName,
          verificationUrl: `${process.env.BASE_URL}/api/v1/users/verify?tkey=${token}`,
        }),
      };

      const emailStatus = await sendEmail(options);
      if (!emailStatus) {
        console.error("Failed to send verification email", emailStatus);
        throw new ApiError(500, "Failed to send verification email.");
      }
    }
  }

  // handling user preferences
  if (dietPreferences && Array.isArray(dietPreferences)) {
    user.dietPreferences = dietPreferences.map((pref) => pref.trim());
  }
  if (allergies && Array.isArray(allergies)) {
    user.allergies = allergies.map((allergy) => allergy.trim());
  }

  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        message: "Profile updated successfully",
      },
      user, // Consider selecting specific fields here
    ),
  );
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
      passwordResetUrl: `${process.env.BASE_URL}/api/v1/auth/reset-password?tkey=${token}`,
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
  const token = req.query.tkey;
  const { password } = req.body;

  console.log("Resetted Password: ", password);
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
    .json(
      new ApiResponse(
        200,
        { message: "Password reset successfully!" },
        { NewPassword: password },
      ),
    );
});

export const addRecipeToFavourites = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user.userId;

  if (recipeId && mongoose.Types.ObjectId.isValid(recipeId)) {
    const recipeExists = await Recipe.findById(recipeId);
    if (!recipeExists) {
      throw new ApiError(404, "Recipe not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.favouriteRecipes.includes(recipeId)) {
      return res.status(200).json({ message: "Recipe already in favorites" });
    }

    user.favouriteRecipes.push(recipeId);
    await user.save();

    return res
      .status(200)
      .json({ message: "Recipe added to favorites successfully" });
  } else {
    const { recipeData } = req.body;
    const userId = req.user.userId;

    if (!recipeData || !recipeData.title || !recipeData.ingredients) {
      throw new ApiError(400, "Invalid AI recipe data provided for favoriting");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const existingRecipe = await Recipe.findOne({
      title: recipeData.title,
    });

    let recipeIdToFavorite;

    if (existingRecipe) {
      recipeIdToFavorite = existingRecipe._id;
    } else {
      const nutrition = await Nutrition.create({
        energy: recipeData.nutritions.energy,
        carbs: recipeData.nutritions.carbs,
        sugars: recipeData.nutritions.sugars,
        dietaryFiber: recipeData.nutritions.dietaryFiber,
        proteins: recipeData.nutritions.proteins,
        fats: recipeData.nutritions.fats,
        saturatedFat: recipeData.nutritions.saturatedFat,
        transFat: recipeData.nutritions.transFat,
        unsaturatedFat: recipeData.nutritions.unsaturatedFat,
        cholesterol: recipeData.nutritions.cholesterol,
        sodium: recipeData.nutritions.sodium,
        potassium: recipeData.nutritions.potassium,
        calcium: recipeData.nutritions.calcium,
        iron: recipeData.nutritions.iron,
        servingSize: recipeData.nutritions.servingSize,
        vitamins: recipeData.nutritions.vitamins.map((vit) => ({
          vitaminName: vit.vitaminName,
          vitaminQuantity: vit.vitaminQuantity,
        })),
      });

      // create new recipe
      const newRecipe = new Recipe({
        recipeImage: recipeData.recipeImage,
        recipeVideoUrl: recipeData.recipeVideoUrl,
        title: recipeData.title,
        description: recipeData.description,
        ratings: recipeData.ratings,
        mealType: recipeData.mealType,
        cookTime: recipeData.cookTime,
        difficultLevel: recipeData.difficultLevel,
        ingredients: recipeData.ingredients.map((ing) => ({
          name: ing.ingredientName,
          quantity: ing.quantity,
        })),
        nutritions: nutrition._id,
        steps: recipeData.steps.map((step) => ({
          stepNumber: step.stepNumber,
          stepContent: step.stepContent,
        })),
      });
      await newRecipe.save();
      recipeIdToFavorite = newRecipe._id;
    }

    if (!user.favouriteRecipes.includes(recipeIdToFavorite)) {
      user.favouriteRecipes.push(recipeIdToFavorite);
      await user.save();
      return res.status(200).json({
        message: "Recipe added to favorites successfully",
        recipeId: recipeIdToFavorite,
      });
    } else {
      return res.status(200).json({ message: "Recipe already in favorites" });
    }
  }
});

export const removeRecipeFromFavourites = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(recipeId)) {
    throw new ApiError(400, "Invalid recipe ID");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const initialFavoritesCount = user.favouriteRecipes.length;

  user.favouriteRecipes = user.favouriteRecipes.filter(
    (favId) => favId.toString() !== recipeId,
  );

  if (user.favouriteRecipes.length === initialFavoritesCount) {
    return res.status(400).json({ message: "Recipe is not in your favorites" });
  }

  await user.save();

  return res
    .status(200)
    .json({ message: "Recipe removed from favorites successfully" });
});

export const getFavouriteRecipes = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const user = await User.findById(userId)
    .populate("favouriteRecipes")
    .populate("nutritions");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json({ favorites: user.favouriteRecipes });
});
