import {
  registerService,
  loginService,
  verifyAccountOtpService,
  forgotPasswordService,
  verifyResetOtpService,
  resetPasswordService,
  refreshAccessTokenService,
  resendAccountOtpService,
  resendResetOtpService,
  logoutService,
} from "../services/index.js";
import { sendSuccess } from "../utils/response.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

// ----------------- REGISTER -----------------
export const registerUser = catchAsync(async (req, res) => {
  const result = await registerService(req.body, req.user || null);
  sendSuccess(res, 201, "User registered successfully", result);
});

// ----------------- LOGIN -----------------
export const loginUser = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await loginService(
    req.body,
    req.ip,
    req.get("User-Agent")
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, 200, "Login successful", { user, accessToken });
});

// ----------------- VERIFY ACCOUNT OTP -----------------
export const verifyAccountOtp = catchAsync(async (req, res) => {
  const result = await verifyAccountOtpService(req.body);
  sendSuccess(res, 200, "Account verified successfully", result);
});

// ----------------- FORGOT PASSWORD -----------------
export const forgotPassword = catchAsync(async (req, res) => {
  const result = await forgotPasswordService(req.body);
  sendSuccess(res, 200, "OTP sent for password reset", result);
});

// ----------------- VERIFY RESET OTP -----------------
export const verifyResetOtp = catchAsync(async (req, res) => {
  const result = await verifyResetOtpService(req.body);
  sendSuccess(res, 200, "Reset OTP verified", result);
});

// ----------------- RESET PASSWORD -----------------
export const resetPassword = catchAsync(async (req, res) => {
  const result = await resetPasswordService(req.body);
  sendSuccess(res, 200, "Password reset successfully", result);
});

// ----------------- RESEND ACCOUNT OTP -----------------
export const resendAccountOtp = catchAsync(async (req, res) => {
  const result = await resendAccountOtpService(req.body);
  sendSuccess(res, 200, "Account OTP resent", result);
});

// ----------------- RESEND RESET OTP -----------------
export const resendResetOtp = catchAsync(async (req, res) => {
  const result = await resendResetOtpService(req.body);
  sendSuccess(res, 200, "Reset OTP resent", result);
});

// ----------------- REFRESH ACCESS TOKEN -----------------
export const refreshAccessToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw new AppError("Refresh token missing", 400);

  const result = await refreshAccessTokenService(
    refreshToken,
    req.ip,
    req.get("User-Agent")
  );
  sendSuccess(res, 200, "Access token refreshed", result);
});

// ----------------- LOGOUT -----------------
export const logout = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  await logoutService(refreshToken);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  sendSuccess(res, 200, "Logged out successfully");
});
