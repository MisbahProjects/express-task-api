// ================= AUTH CONTROLLERS =================
export {
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
} from "./authController.js";

// ================= USER PROFILE CONTROLLERS =================
export {
  getMe,
  getUserById,
  getAllUsers,
  updateMe,
  updateUserById,
  createUser,
  deleteUserById,
} from "./userController.js";

// ================= TASK CONTROLLERS =================
export {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "./taskController.js";
