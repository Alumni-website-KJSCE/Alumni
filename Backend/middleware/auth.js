import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import dotenv from "dotenv";

dotenv.config();

// Middleware to authenticate JWT token
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Authentication token missing" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Optionally fetch full user from DB
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Middleware to check admin privileges
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
};

// Middleware to check if user is approved
export const isApproved = (req, res, next) => {
  if (req.user && req.user.isApproved) {
    return next();
  }
  return res.status(403).json({ message: "User approval required" });
};
