import {
  createTaskService,
  updateTaskService,
  deleteTaskService,
  getTasksByUserService,
  getTaskByIdService,
} from "../services/index.js";
import { sendSuccess } from "../utils/response.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

// ----------------- LIST TASKS WITH FILTERS, PAGINATION & SORTING -----------------
export const listTasks = catchAsync(async (req, res, next) => {
  console.log("===== listTasks controller called =====");
  console.log("User:", req.user._id, "Role:", req.user.role);
  console.log("Query Params:", req.query);

  const tasksData = await getTasksByUserService(req.user, req.query);

  console.log("Tasks fetched:", tasksData.tasks.length);
  sendSuccess(res, 200, "Tasks fetched successfully", tasksData);
});

// ----------------- GET TASK BY ID -----------------
export const getTaskById = catchAsync(async (req, res, next) => {
  console.log("===== getTaskById controller called =====");
  console.log(
    "User:",
    req.user._id,
    "Role:",
    req.user.role,
    "Task ID:",
    req.params.id
  );

  const task = await getTaskByIdService(req.user, req.params.id);
  if (!task) {
    console.log("Task not found!");
    throw new AppError("Task not found", 404);
  }

  console.log("Task fetched:", task._id);
  sendSuccess(res, 200, "Task fetched successfully", task);
});

// ----------------- CREATE TASK -----------------
export const createTask = catchAsync(async (req, res, next) => {
  console.log("===== createTask controller called =====");
  console.log("User:", req.user._id, "Role:", req.user.role, "Body:", req.body);

  const task = await createTaskService(req.body, req.user);

  console.log("Task created:", task._id);
  sendSuccess(res, 201, "Task created successfully", task);
});

// ----------------- UPDATE TASK -----------------
export const updateTask = catchAsync(async (req, res, next) => {
  console.log("===== updateTask controller called =====");
  console.log(
    "User:",
    req.user._id,
    "Role:",
    req.user.role,
    "Task ID:",
    req.params.id,
    "Body:",
    req.body
  );

  const task = await updateTaskService(req.params.id, req.body, req.user);
  if (!task) {
    console.log("Task not found or update failed");
    throw new AppError("Task not found or update failed", 404);
  }

  console.log("Task updated:", task._id);
  sendSuccess(res, 200, "Task updated successfully", task);
});

// ----------------- DELETE TASK -----------------
export const deleteTask = catchAsync(async (req, res, next) => {
  console.log("===== deleteTask controller called =====");
  console.log(
    "User:",
    req.user._id,
    "Role:",
    req.user.role,
    "Task ID:",
    req.params.id
  );

  const result = await deleteTaskService(req.params.id, req.user);
  if (!result) {
    console.log("Task not found or delete failed");
    throw new AppError("Task not found or delete failed", 404);
  }

  console.log("Task deleted:", result.id);
  sendSuccess(res, 200, "Task deleted successfully", result);
});
