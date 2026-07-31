// services/taskService.js
import { User, Task } from "../models/index.js";
import AppError from "../utils/AppError.js";

/**
 * Get tasks with filtering, pagination, sorting based on user role
 * @param {Object} user - current logged-in user
 * @param {Object} query - query params: page, limit, status, priority, dueDate, search, sortBy, order
 */
export const getTasksByUserService = async (user, query = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    dueDate,
    search = "",
    sortBy = "dueDate",
    order = "asc",
  } = query;

  const filter = {};

  // ---------------- Role-based access ----------------
  if (user.role === "Admin") {
    // Admin sees all tasks
  } else if (user.role === "Manager") {
    // Manager sees tasks they created or assigned to themselves
    filter.$or = [{ createdBy: user._id }, { assignedTo: user._id }];
  } else {
    // Regular user sees only assigned tasks
    filter.assignedTo = user._id;
  }

  // ---------------- Additional filters ----------------
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (dueDate) filter.dueDate = { $lte: new Date(dueDate) };
  if (search) filter.title = { $regex: search, $options: "i" };

  // ---------------- Pagination ----------------
  const skip = (Number(page) - 1) * Number(limit);
  const total = await Task.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  // ---------------- Sorting ----------------
  const sortOrder = order.toLowerCase() === "desc" ? -1 : 1;
  const sortObj = { [sortBy]: sortOrder };

  // ---------------- Fetch tasks ----------------
  const tasks = await Task.find(filter)
    .populate("assignedTo createdBy", "name email role")
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit));

  return {
    tasks,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages },
  };
};

/**
 * Get single task by ID with role-based access
 */
export const getTaskByIdService = async (user, taskId) => {
  const task = await Task.findById(taskId).populate(
    "assignedTo createdBy",
    "name email role"
  );
  if (!task) throw new AppError("Task not found", 404);

  if (user.role === "Admin") return task;

  const isCreator = task.createdBy._id.toString() === user._id.toString();
  const isAssignee = task.assignedTo._id.toString() === user._id.toString();

  if (user.role === "Manager" && !isCreator && !isAssignee) {
    throw new AppError("Access denied", 403);
  }

  if (user.role === "User" && !isAssignee) {
    throw new AppError("Access denied", 403);
  }

  return task;
};

/**
 * Create a new task
 */
export const createTaskService = async (data, creator) => {
  if (!["Admin", "Manager"].includes(creator.role)) {
    throw new AppError("Access denied", 403);
  }

  if (!data.assignedTo) {
    throw new AppError("assignedTo is required", 400);
  }

  const assignedUser = await User.findById(data.assignedTo);
  if (!assignedUser) throw new AppError("Assigned user not found", 404);

  if (creator.role === "Manager" && assignedUser.role !== "User") {
    throw new AppError("Managers can assign tasks only to Users", 403);
  }

  const task = await Task.create({
    title: data.title,
    description: data.description,
    assignedTo: assignedUser._id,
    dueDate: data.dueDate,
    priority: data.priority || "Medium",
    status: "Pending",
    createdBy: creator._id,
  });

  return task.populate("assignedTo createdBy", "name email role");
};

/**
 * Update a task
 */
export const updateTaskService = async (taskId, updates, actor) => {
  const task = await Task.findById(taskId);
  if (!task) throw new AppError("Task not found", 404);

  // ---------------- Role-based update ----------------
  if (actor.role === "User") {
    if (task.assignedTo.toString() !== actor._id.toString()) {
      throw new AppError("Access denied", 403);
    }
    task.status = updates.status || task.status;
  } else if (actor.role === "Manager") {
    if (task.createdBy.toString() !== actor._id.toString()) {
      throw new AppError("Managers can update only tasks they created", 403);
    }
    Object.assign(task, updates);
  } else if (actor.role === "Admin") {
    Object.assign(task, updates);
  }

  await task.save();
  return task.populate("assignedTo createdBy", "name email role");
};

/**
 * Delete a task (Admin only)
 */
export const deleteTaskService = async (taskId, actor) => {
  if (actor.role !== "Admin") {
    throw new AppError("Only Admin can delete tasks", 403);
  }

  const task = await Task.findById(taskId);
  if (!task) throw new AppError("Task not found", 404);

  await Task.deleteOne({ _id: taskId });
  return { id: taskId, deleted: true };
};
