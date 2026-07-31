// routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  verifyAccountOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  resendAccountOtp,
  resendResetOtp,
  refreshAccessToken,
  logout,
} from "../controllers/authController.js";
import { userAuth } from "../middleware/userAuth.js";
import {
  registerValidation,
  loginValidation,
  verifyOtpValidation,
  resetPasswordValidation,
  validate,
} from "../utils/validators/index.js";

const router = express.Router();

// ---------------- PUBLIC ROUTES ----------------
router.post("/register", validate(registerValidation), registerUser);
router.post("/login", validate(loginValidation), loginUser);
router.post("/verify-account", validate(verifyOtpValidation), verifyAccountOtp);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", validate(verifyOtpValidation), verifyResetOtp);
router.post(
  "/reset-password",
  validate(resetPasswordValidation),
  resetPassword
);
router.post("/resend-account-otp", resendAccountOtp);
router.post("/resend-reset-otp", resendResetOtp);

// ---------------- PROTECTED ROUTES ----------------
router.post("/refresh", refreshAccessToken);
router.post("/logout", userAuth, logout);

export default router;
