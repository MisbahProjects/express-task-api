import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdByIp: { type: String },
    userAgent: { type: String },
    revoked: { type: Boolean, default: false },
    revokedAt: { type: Date, default: null },
    replacedByToken: { type: String, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ token: 1 });

export default mongoose.model("RefreshToken", refreshTokenSchema);
