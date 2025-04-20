import imagekit from "../config/imagekit.js";
import { ApiError } from "./apiError.util.js";

const uploadImage = async (filePath, fileName) => {
  try {
    const response = await imagekit.upload({
      file: filePath, // required
      fileName: fileName, // required
      folder: "avatars", // optional
      isPrivateFile: false, // optional
      tags: ["avatar"], // optional
    });
    return response;
  } catch (error) {
    console.error("Error uploading image to ImageKit:", error);
    throw new ApiError(500, "Error uploading image to ImageKit", error.message);
  }
};

export default uploadImage;
