import express from "express";
import {
  getMe,
  getUserById,
  getAllUsers,
  updateMe,
  updateUserById,
  createUser,
  deleteUserById,
} from "../controllers/index.js";

import { userAuth, authorizeRoles } from "../middleware/index.js";

const router = express.Router();

// ---------------- Current user routes ----------------
router.get("/me", userAuth, getMe);
router.put("/me", userAuth, updateMe);

// ---------------- Admin/Manager routes ----------------
// Supports pagination, sorting, filtering via query params
// Example: /users?page=2&limit=10&sortBy=name&order=asc&role=User&search=misbah
router.get("/", userAuth, authorizeRoles("Admin", "Manager"), getAllUsers);
router.get("/:id", userAuth, authorizeRoles("Admin", "Manager"), getUserById);
router.put(
  "/:id",
  userAuth,
  authorizeRoles("Admin", "Manager"),
  updateUserById
);
router.post("/", userAuth, authorizeRoles("Admin", "Manager"), createUser);

// ---------------- Admin only: delete user ----------------
router.delete("/:id", userAuth, authorizeRoles("Admin"), deleteUserById);

export default router;
