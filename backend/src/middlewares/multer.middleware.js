import multer from "multer";
import path from "path";

const createUploadMiddleware = (destinationFolder) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const destinationPath = path.join("./public", destinationFolder);
      cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = path.extname(file.originalname);
      cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
    },
  });

  return multer({ storage: storage });
};

// For uploading a avatar image
export const uploadProfileImage =
  createUploadMiddleware("profiles").single("avatar");

// For uploading a input image
export const uploadGeneralImage =
  createUploadMiddleware("uploads").single("image");
