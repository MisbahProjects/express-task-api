export const validatePassword = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false; // Uppercase
  if (!/[a-z]/.test(password)) return false; // Lowercase
  if (!/[0-9]/.test(password)) return false; // Number
  if (!/[@$!%*?&]/.test(password)) return false; // Special char
  return true;
};
