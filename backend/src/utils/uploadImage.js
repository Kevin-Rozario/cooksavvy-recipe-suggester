import imagekit from "../config/imagekit.js";

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
    throw error;
  }
};

export default uploadImage;
