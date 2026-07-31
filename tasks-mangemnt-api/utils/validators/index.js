// ===================== AUTH VALIDATIONS =====================
export {
  registerValidation,
  loginValidation,
  verifyOtpValidation,
  resetPasswordValidation,
} from "./authValidator.js";

// ===================== PASSWORD VALIDATOR =====================
export { validatePassword } from "./passwordValidator.js";

// ===================== TASK VALIDATIONS =====================
export { taskCreateValidation, taskUpdateValidation } from "./taskValidator.js";

// ===================== TASK ID PARAM MIDDLEWARE =====================
export { idParam } from "./taskValidator.js";

// ===================== GENERIC VALIDATION MIDDLEWARE =====================
export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
