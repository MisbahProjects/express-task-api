import { Otp } from "../../models/index.js";

// OTP Expiry (10 minutes)
const OTP_EXPIRY = 10 * 60 * 1000;

/* ================= GENERATE OTP ================= */
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* ================= OTP EXPIRY ================= */
export const getOtpExpiry = () => {
  return new Date(Date.now() + OTP_EXPIRY);
};

/* ================= ACCOUNT OTP ================= */
export const setAccountOtp = async (user) => {
  const otp = generateOtp();
  const otpExpiry = getOtpExpiry();

  await Otp.updateMany(
    { user: user._id, type: "verify", used: false },
    { used: true }
  );

  const otpRecord = await Otp.create({
    user: user._id,
    otp: otp,
    type: "verify",
    expiresAt: otpExpiry,
  });

  console.log(" ACCOUNT OTP GENERATED");
  console.log("Email:", user.email);
  console.log("OTP:", otp);
  console.log("Expires At:", otpExpiry.toISOString());
  console.log("NOW:", new Date().toISOString());

  return { otp, otpExpiry };
};

/* ================= RESET OTP ================= */
export const setResetOtp = async (user) => {
  const otp = generateOtp();
  const otpExpiry = getOtpExpiry();

  await Otp.updateMany(
    { user: user._id, type: "reset", used: false },
    { used: true }
  );

  const otpRecord = await Otp.create({
    user: user._id,
    otp: otp,
    type: "reset",
    expiresAt: otpExpiry,
  });

  console.log(" RESET OTP GENERATED");
  console.log("Email:", user.email);
  console.log("OTP:", otp);
  console.log("Expires At:", otpExpiry.toISOString());
  console.log("NOW:", new Date().toISOString());

  return { otp, otpExpiry };
};
