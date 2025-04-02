import { ApiResponse } from "../utils/apiResponse.util.js";
import asyncHandler from "../utils/asyncHandler.util.js";

export const loginUser = asyncHandler((req, res) => {
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { message: "User logged in successfully!" },
        req.body,
      ),
    );
});
