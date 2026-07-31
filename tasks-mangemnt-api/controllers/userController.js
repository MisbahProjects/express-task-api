import {
  getUserProfileService,
  updateUserProfileService,
  createUserService,
  getAllUsersService,
  deleteUserService,
} from "../services/index.js";
import { sendSuccess } from "../utils/response.js";
import { catchAsync } from "../utils/catchAsync.js";

// Get current user
export const getMe = catchAsync(async (req, res) => {
  const profile = await getUserProfileService(req.user);
  sendSuccess(res, 200, "Profile fetched successfully", profile);
});

// Get any user by ID (Admin/Manager)
export const getUserById = catchAsync(async (req, res) => {
  const profile = await getUserProfileService(req.user, req.params.id);
  sendSuccess(res, 200, "User profile fetched successfully", profile);
});

// Get all users (Admin/Manager)
export const getAllUsers = catchAsync(async (req, res) => {
  const data = await getAllUsersService(req.user, req.query);
  sendSuccess(res, 200, "Users fetched successfully", data);
});

// Update current user
export const updateMe = catchAsync(async (req, res) => {
  const updated = await updateUserProfileService(
    req.user,
    req.body,
    null,
    req.ip,
    req.get("User-Agent")
  );
  sendSuccess(res, 200, "Profile updated successfully", updated);
});

// Update any user (Admin/Manager)
export const updateUserById = catchAsync(async (req, res) => {
  const updated = await updateUserProfileService(
    req.user,
    req.body,
    req.params.id,
    req.ip,
    req.get("User-Agent")
  );
  sendSuccess(res, 200, "User updated successfully", updated);
});

// Create a user (Admin/Manager)
export const createUser = catchAsync(async (req, res) => {
  const created = await createUserService(req.user, req.body);
  sendSuccess(res, 201, "User created successfully", created);
});

// Delete a user (Admin only)
export const deleteUserById = catchAsync(async (req, res) => {
  const deleted = await deleteUserService(req.user, req.params.id);
  sendSuccess(res, 200, "User deleted successfully", deleted);
});
