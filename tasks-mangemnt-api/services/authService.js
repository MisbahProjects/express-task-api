// services/authService.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import { User, Otp, RefreshToken } from "../models/index.js";
import { generateTokens } from "../utils/generateToken.js";
import { persistRefreshToken } from "../utils/helpers/refreshTokenHelper.js";
import { setAccountOtp, setResetOtp } from "../utils/helpers/otpHelper.js";
import { sendEmail } from "../config/index.js";
import { auditLogger } from "../utils/auditLogger.js";
import { validatePassword } from "../utils/validators/index.js";

/**
 * Register a user
 * RBAC-safe:
 * - Public registration → only "User"
 * - Admin → any role
 * - Manager → only "User"
 */
export async function registerService(
  { name, email, password, role = "User" },
  creator = null
) {
  const lowerEmail = email.toLowerCase();

  if (await User.findOne({ email: lowerEmail })) {
    throw new AppError("User already exists", 409);
  }

  const allowedRoles = ["Admin", "Manager", "User"];
  if (!allowedRoles.includes(role)) throw new AppError("Invalid role", 400);

  if (!creator && role !== "User") {
    throw new AppError(
      "Only Users can self-register. Contact Admin to create other accounts.",
      403
    );
  }

  if (creator) {
    switch (creator.role) {
      case "User":
        throw new AppError("Users cannot create any accounts.", 403);
      case "Manager":
        if (role !== "User")
          throw new AppError("Managers can only create User accounts.", 403);
        break;
      case "Admin":
        break; // Admin can create any role
      default:
        throw new AppError("Invalid creator role.", 400);
    }
  }

  if (!validatePassword(password))
    throw new AppError("Password complexity not met", 400);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: lowerEmail,
    password: hashedPassword,
    role,
    isAccountVerified: false,
    createdBy: creator ? creator._id : null,
  });

  const { otp, otpExpiry } = await setAccountOtp(user);

  await sendEmail(
    lowerEmail,
    "Verify Email - Taskify",
    "otp",
    { name, otp },
    true
  );

  auditLogger(
    user._id,
    creator ? `Registered by ${creator.role}` : "Self registration"
  );

  return {
    message: `User registered as ${role}. OTP sent to email.`,
    expiresAt: otpExpiry.getTime(),
  };
}

/**
 * Verify account OTP
 */
export async function verifyAccountOtpService({ email, otp }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError("User not found", 404);

  const otpDoc = await Otp.findOne({
    user: user._id,
    type: "verify",
    used: false,
  }).sort({ createdAt: -1 });

  if (!otpDoc) throw new AppError("OTP not found or already used", 400);
  if (otpDoc.expiresAt < new Date()) throw new AppError("OTP expired", 400);
  if (otpDoc.otp !== String(otp)) throw new AppError("Invalid OTP", 400);

  otpDoc.used = true;
  await otpDoc.save();

  user.isAccountVerified = true;
  await user.save();

  await sendEmail(
    user.email,
    "Account Verified",
    "verified",
    { name: user.name },
    true
  );

  auditLogger(user._id, "Account verified via OTP");

  return { message: "Account verified successfully. You can now log in." };
}

/**
 * Login user
 */
export async function loginService(
  { email, password },
  ip = null,
  userAgent = null
) {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.isAccountVerified)
    throw new AppError(
      "Account not verified. Please verify your email first.",
      403
    );

  const { accessToken, refreshToken } = generateTokens(user._id);

  await persistRefreshToken({
    token: refreshToken,
    userId: user._id,
    ip,
    userAgent,
  });

  auditLogger(user._id, "User logged in");
  user.password = undefined;

  return { user, accessToken, refreshToken };
}

/**
 * Logout
 */
export async function logoutService(refreshToken) {
  if (!refreshToken) throw new AppError("Refresh token missing", 400);

  const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
  if (tokenDoc) {
    tokenDoc.revoked = true;
    tokenDoc.revokedAt = new Date();
    await tokenDoc.save();
  }

  return { success: true };
}

/**
 * Refresh access token
 */
export async function refreshAccessTokenService(
  oldRefreshToken,
  ip = null,
  userAgent = null
) {
  if (!oldRefreshToken) throw new AppError("No refresh token provided", 400);

  let decoded;
  try {
    decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const { accessToken, refreshToken } = generateTokens(decoded.id);

  await RefreshToken.findOneAndUpdate(
    { token: oldRefreshToken },
    { revoked: true, revokedAt: new Date(), replacedByToken: refreshToken }
  );

  await persistRefreshToken({
    token: refreshToken,
    userId: decoded.id,
    ip,
    userAgent,
  });

  auditLogger(decoded.id, "Refresh token rotated");

  return { accessToken, refreshToken };
}

/**
 * Forgot password
 */
export async function forgotPasswordService({ email }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError("User not found", 404);

  const { otp, otpExpiry } = await setResetOtp(user);

  await sendEmail(
    user.email,
    "Reset Password OTP",
    "reset",
    { name: user.name, otp },
    true
  );

  auditLogger(user._id, "Reset password requested");

  return { message: "Reset OTP sent to email", expiresAt: otpExpiry.getTime() };
}

/**
 * Verify reset OTP
 */
export async function verifyResetOtpService({ email, otp }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError("User not found", 404);

  const otpDoc = await Otp.findOne({
    user: user._id,
    type: "reset",
    used: false,
  }).sort({ createdAt: -1 });

  if (!otpDoc) throw new AppError("OTP not found or already used", 400);
  if (otpDoc.expiresAt < new Date()) throw new AppError("OTP expired", 400);
  if (otpDoc.otp !== String(otp)) throw new AppError("Invalid OTP", 400);

  otpDoc.used = true;
  await otpDoc.save();

  auditLogger(user._id, "Reset OTP verified");

  return { message: "Reset OTP verified successfully" };
}

/**
 * Reset password
 */
export async function resetPasswordService({ email, otp, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError("User not found", 404);

  const otpDoc = await Otp.findOne({
    user: user._id,
    type: "reset",
    used: false,
  }).sort({ createdAt: -1 });

  if (!otpDoc) throw new AppError("OTP not found or already used", 400);
  if (otpDoc.expiresAt < new Date()) throw new AppError("OTP expired", 400);
  if (otpDoc.otp !== String(otp)) throw new AppError("Invalid OTP", 400);

  if (!validatePassword(password))
    throw new AppError("Password complexity not met", 400);

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  otpDoc.used = true;
  await otpDoc.save();

  await sendEmail(
    user.email,
    "Password Changed",
    "passwordChanged",
    { name: user.name },
    true
  );

  auditLogger(user._id, "Password reset successfully");

  return { message: "Password reset successfully" };
}

/**
 * Resend OTPs
 */
export async function resendAccountOtpService({ email }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError("User not found", 404);
  if (user.isAccountVerified)
    throw new AppError("Account already verified", 400);

  const { otp, otpExpiry } = await setAccountOtp(user);
  await sendEmail(
    user.email,
    "Resend Account OTP",
    "otp",
    { name: user.name, otp },
    true
  );
  auditLogger(user._id, "Account OTP resent");

  return { message: "Account OTP resent", expiresAt: otpExpiry.getTime() };
}

export async function resendResetOtpService({ email }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError("User not found", 404);

  const { otp, otpExpiry } = await setResetOtp(user);
  await sendEmail(
    user.email,
    "Resend Reset OTP",
    "reset",
    { name: user.name, otp },
    true
  );
  auditLogger(user._id, "Reset OTP resent");

  return { message: "Reset OTP resent", expiresAt: otpExpiry.getTime() };
}
