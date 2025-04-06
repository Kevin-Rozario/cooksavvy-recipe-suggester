import { ApiError } from "../utils/apiError.util.js";
import jwt from "jsonwebtoken";

const authMiddleware = async (req, _res, next) => {
  // get tokens
  const { accessToken, refreshToken } = req.cookies;

  // check tokens
  if (!accessToken || !refreshToken) {
    throw new ApiError(400, "Access and refresh tokens required!");
  }

  // verify access token
  try {
    const decoded = await jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET,
    );
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Access token expired!", error);
    throw new ApiError(401, "Access token expired!");
  }
};

export { authMiddleware };
