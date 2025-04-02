import { ApiResponse } from "../utils/apiResponse.util.js";

export const healthCheck = (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, { message: "Server is up and running..." }, {}));
};
