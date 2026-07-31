import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ---------------- BASIC INFO ----------------
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    // ---------------- ROLE & STATUS ----------------
    role: {
      type: String,
      enum: ["Admin", "Manager", "User"],
      default: "User",
    },

    isAccountVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ---------------- AUDIT ----------------
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// ---------------- INDEXES ----------------
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// ---------------- JSON CLEANUP ----------------
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.password;
  },
});

export default mongoose.model("User", userSchema);
