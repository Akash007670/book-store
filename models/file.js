import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String, // image | raw | video
    },
  },
  { _id: false }, // prevents nested _id for file object
);

export { FileSchema };
