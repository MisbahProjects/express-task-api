import Joi from "joi";

// ---------------- CREATE TASK VALIDATION ----------------
export const taskCreateValidation = Joi.object({
  title: Joi.string().trim().max(200).required().messages({
    "string.empty": "Title is required",
    "string.max": "Title must not exceed 200 characters",
  }),
  description: Joi.string().trim().max(1000).optional().messages({
    "string.max": "Description must not exceed 1000 characters",
  }),
  priority: Joi.string().valid("Low", "Medium", "High").optional().messages({
    "any.only": "Priority must be Low, Medium or High",
  }),
  status: Joi.string()
    .valid("Pending", "In Progress", "Completed")
    .optional()
    .messages({
      "any.only": "Invalid task status",
    }),
  assignedTo: Joi.array()
    .items(Joi.string().hex().length(24))
    .optional()
    .messages({
      "string.length": "assignedTo must contain valid user IDs",
    }),
  dueDate: Joi.date().iso().optional().messages({
    "date.format": "dueDate must be a valid ISO date",
  }),
});

// ---------------- UPDATE TASK VALIDATION ----------------
export const taskUpdateValidation = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  description: Joi.string().trim().max(1000).optional(),
  priority: Joi.string().valid("Low", "Medium", "High").optional(),
  status: Joi.string().valid("Pending", "In Progress", "Completed").optional(),
  assignedTo: Joi.array().items(Joi.string().hex().length(24)).optional(),
  dueDate: Joi.date().iso().optional(),
});

// ---------------- ID PARAM VALIDATION MIDDLEWARE ----------------
export const idParam = (req, res, next) => {
  const { id } = req.params;
  const schema = Joi.string().hex().length(24).required();

  const { error } = schema.validate(id);
  if (error) {
    return res.status(400).json({ message: "Invalid ID parameter" });
  }
  next();
};
