import Joi from "joi";

// ----------------- REGISTER VALIDATION -----------------
export const registerValidation = Joi.object({
  name: Joi.string().trim().max(100).required().messages({
    "string.empty": "Name is required",
    "string.max": "Name should not exceed 100 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Valid email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
  role: Joi.string().valid("Admin", "Manager", "User").optional().messages({
    "any.only": "Invalid role",
  }),
});

// ----------------- LOGIN VALIDATION -----------------
export const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Valid email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

// ----------------- VERIFY OTP -----------------
export const verifyOtpValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Valid email is required",
  }),
  otp: Joi.string().length(6).required().messages({
    "string.empty": "OTP is required",
    "string.length": "OTP must be 6 digits",
  }),
});

// ----------------- RESET PASSWORD -----------------
export const resetPasswordValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Valid email is required",
  }),
  otp: Joi.string().length(6).required().messages({
    "string.empty": "OTP is required",
    "string.length": "OTP must be 6 digits",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
});
