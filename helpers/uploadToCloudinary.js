import { cloudinary } from "../config/cloudinary.js";

const uploadFile = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
    });

    if (!result) {
      throw new Error("Something went wrong");
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
    };
  } catch (error) {
    console.error("Error while uploading to cloudinary", error);
    throw new Error("Something went wrong while uploading file");
  }
};

export { uploadFile };
