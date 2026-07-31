import express from "express";
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
} from "../controllers/index.js";

import { userAuth, authorizeRoles } from "../middleware/index.js";
import {
  taskCreateValidation,
  taskUpdateValidation,
  idParam,
  validate,
} from "../utils/validators/index.js";

const router = express.Router();

// All routes require authentication
router.use(userAuth);

// ---------------- Get tasks (with pagination, filtering, sorting) ----------------
// Example: /tasks?page=1&limit=10&sortBy=dueDate&order=asc&status=Pending&priority=High
router.get("/", listTasks);

// Get single task by ID
router.get("/:id", idParam, getTaskById);

// Create a task (Admin / Manager only)
router.post(
  "/",
  authorizeRoles("Admin", "Manager"),
  validate(taskCreateValidation),
  createTask
);

// Update task (Users can update their task status, Admin/Manager can update full task)
router.put("/:id", idParam, validate(taskUpdateValidation), updateTask);

// Delete task (Admin only)
router.delete("/:id", idParam, authorizeRoles("Admin"), deleteTask);

export default router;
