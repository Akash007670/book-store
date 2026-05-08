import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    index: true,
  },
  tokenHash: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  replacedBy: { type: mongoose.Types.ObjectId, ref: "RefreshToken" },
});

const RefreshToken = mongoose.model("RefreshTokenSchema", RefreshTokenSchema);
export default RefreshToken;
