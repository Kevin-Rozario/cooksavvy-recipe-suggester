import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { AllergiesList, DietList } from "../utils/constants.js";

const userSchema = new mongoose.Schema(
  {
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: "https://placehold.co/600x400",
        localPath: "",
      },
    },
    userName: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
      required: true,
    },
    fullName: {
      type: String,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    dietPreferences: {
      type: [String],
      enum: DietList,
      default: undefined,
    },
    allergies: {
      type: [String],
      enum: AllergiesList,
      default: undefined,
    },
    favouriteRecipes: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Recipe",
        },
      ],
      default: [],
    },
    refreshToken: {
      type: String,
      default: undefined,
    },
    forgotPasswordToken: {
      type: String,
      default: undefined,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
      default: undefined,
    },
    emailVerificationTokenExpiry: {
      type: Date,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      email: this.email,
      username: this.userName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      userId: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.generateTemporaryOtp = function () {
  const unhashedOtp = Math.floor(100000 + Math.random() * 900000);
  console.log(unhashedOtp);
  const hashedOtp = crypto
    .createHash("sha256")
    .update(unhashedOtp)
    .digest("hex");
  const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins

  return { unhashedOtp, hashedOtp, otpExpiry };
};

const User = mongoose.model("User", userSchema);
export default User;
