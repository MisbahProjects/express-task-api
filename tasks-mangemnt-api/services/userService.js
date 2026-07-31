import bcrypt from "bcryptjs";
import AppError from "../utils/AppError.js";
import { User } from "../models/index.js";
import { validatePassword } from "../utils/validators/index.js";
import { auditLogger } from "../utils/auditLogger.js";

/**
 * Get user profile
 * - Users → only self
 * - Managers → cannot access Admin
 * - Admin → access anyone
 */
export async function getUserProfileService(requester, userId = null) {
  let user;
  if (userId) {
    user = await User.findById(userId).populate("createdBy", "id name role");
    if (!user) throw new AppError("User not found", 404);

    if (
      requester.role === "User" &&
      requester._id.toString() !== user._id.toString()
    ) {
      throw new AppError("Not authorized to view this profile", 403);
    }
    if (requester.role === "Manager" && user.role === "Admin") {
      throw new AppError("Not authorized to view Admin profile", 403);
    }
  } else {
    user = await User.findById(requester._id).populate(
      "createdBy",
      "id name role"
    );
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isAccountVerified: user.isAccountVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    createdBy: user.createdBy
      ? {
          id: user.createdBy._id,
          name: user.createdBy.name,
          role: user.createdBy.role,
        }
      : null,
  };
}

/**
 * Update user profile
 */
export async function updateUserProfileService(
  requester,
  data,
  userId = null,
  ip = null,
  userAgent = null
) {
  let user;
  if (userId) {
    user = await User.findById(userId).populate("createdBy", "id name role");
    if (!user) throw new AppError("User not found", 404);

    if (
      requester.role === "User" &&
      requester._id.toString() !== user._id.toString()
    ) {
      throw new AppError("Not authorized to update this profile", 403);
    }
    if (requester.role === "Manager" && user.role === "Admin") {
      throw new AppError("Not authorized to update Admin profile", 403);
    }
  } else {
    user = await User.findById(requester._id).populate(
      "createdBy",
      "id name role"
    );
  }

  const { name, password } = data;
  if (!name && !password) throw new AppError("No changes provided", 400);

  if (name) user.name = name;
  if (password) {
    if (!validatePassword(password))
      throw new AppError("Password complexity not met", 400);
    user.password = await bcrypt.hash(password, 10);
  }

  await user.save();
  auditLogger(user._id, "Profile updated", ip, userAgent);

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdBy: user.createdBy
      ? {
          id: user.createdBy._id,
          name: user.createdBy.name,
          role: user.createdBy.role,
        }
      : null,
  };
}

/**
 * Create user (Admin/Manager)
 */
export async function createUserService(requester, data) {
  const { name, email, password, role = "User" } = data;
  const lowerEmail = email.toLowerCase();

  if (await User.findOne({ email: lowerEmail }))
    throw new AppError("User already exists", 409);
  if (requester.role === "User")
    throw new AppError("Users cannot create accounts", 403);
  if (requester.role === "Manager" && role !== "User")
    throw new AppError("Managers can only create User accounts", 403);
  if (!validatePassword(password))
    throw new AppError("Password complexity not met", 400);

  const hashedPassword = await bcrypt.hash(password, 10);
  const isVerified = ["Admin", "Manager"].includes(requester.role);

  const user = await User.create({
    name,
    email: lowerEmail,
    password: hashedPassword,
    role,
    isAccountVerified: isVerified,
    createdBy: requester._id,
  });

  auditLogger(user._id, `Created by ${requester.role}`);
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isAccountVerified: user.isAccountVerified,
    createdBy: {
      id: requester._id,
      name: requester.name || null,
      role: requester.role,
    },
  };
}

/**
 * Get all users (with pagination, sorting, filtering)
 */
export async function getAllUsersService(requester, query = {}) {
  const {
    page = 1,
    limit = 10,
    role,
    search,
    sortBy = "createdAt",
    order = "desc",
  } = query;

  const skip = (page - 1) * limit;
  const sortOrder = order.toLowerCase() === "desc" ? -1 : 1;

  let filter = {};
  if (requester.role === "Manager") filter.role = "User";
  if (requester.role === "User") filter._id = requester._id;
  if (role) filter.role = role;
  if (search) filter.name = { $regex: search, $options: "i" };

  const users = await User.find(filter)
    .populate("createdBy", "id name role")
    .skip(skip)
    .limit(Number(limit))
    .sort({ [sortBy]: sortOrder });

  const total = await User.countDocuments(filter);

  return {
    users: users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAccountVerified: user.isAccountVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdBy: user.createdBy
        ? {
            id: user.createdBy._id,
            name: user.createdBy.name,
            role: user.createdBy.role,
          }
        : null,
    })),
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Delete a user (Admin only)
 */
export async function deleteUserService(requester, userId) {
  if (requester.role !== "Admin")
    throw new AppError("Only Admin can delete users", 403);

  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  await User.deleteOne({ _id: userId });
  auditLogger(userId, "User deleted", null, null);

  return { id: userId, deleted: true };
}
