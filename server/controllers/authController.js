// controllers/authController.js

import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Register a new user (public) - only creates normal users
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body; // <-- include role

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // Only allow 'user' or 'hr' roles from frontend
    let finalRole = (role || "user").toLowerCase();
    if (!["user", "hr"].includes(finalRole)) finalRole = "user";

    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
    });

    if (user) {
      const token = generateToken(user._id);
      res.status(201).json({
        message: "User registered successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token,
        },
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Admin/HR create user (protected)
 * @route POST /api/auth/create
 * @access HR/Admin (protected route)
 *
 * Rules:
 * - If creator is admin -> can set role to "admin", "hr", or "user"
 * - If creator is hr -> can set role to "hr" or "user" but NOT "admin"
 * - If role not provided or invalid -> defaults to "user"
 */
export const createUserByAdmin = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });

    const { name, email, password, role } = req.body;

    // Check permission: allow only hr or admin to call this endpoint
    if (!(req.user.role === "hr" || req.user.role === "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    // Protect against duplicate email
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    // Decide allowed role
    let finalRole = "user";
    const requested = (role || "").toLowerCase();

    if (req.user.role === "admin") {
      // admin can create any role
      if (["user", "hr", "admin"].includes(requested)) finalRole = requested;
    } else if (req.user.role === "hr") {
      // hr can create hr or user but not admin
      if (["user", "hr"].includes(requested)) finalRole = requested;
      else finalRole = "user";
    }

    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
    });

    if (user) {
      res.status(201).json({
        message: "User created successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("createUserByAdmin error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user & get JWT
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // explicitly select password since it's select: false
    const user = await User.findOne({ email }).select("+password");
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};