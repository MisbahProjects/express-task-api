import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import AppError from "../utils/AppError.js";

export const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log("Authorization header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Access denied. No token provided.", 401);
    }

    const token = authHeader.split(" ")[1];
    // console.log("Token received:", token);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);
    } catch (err) {
      // console.error("JWT verification error:", err.message);
      throw new AppError("Invalid or expired token", 401);
    }

    const user = await User.findById(decoded.id).select("-password");
    // console.log("User found:", user);

    if (!user) throw new AppError("User not found", 404);

    req.user = user;
    next();
  } catch (err) {
    // console.error("Auth middleware error:", err.message);
    return res.status(err.statusCode || 401).json({ message: err.message });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // console.log("User role:", req.user?.role);
    if (!req.user)
      return res
        .status(401)
        .json({ message: "Unauthorized: No user attached" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    next();
  };
};
