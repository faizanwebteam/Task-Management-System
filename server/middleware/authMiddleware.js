import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

/**
 * protect - Express middleware to require a valid JWT.
 * Supports token from:
 *  - Authorization: Bearer <token>
 *  - req.cookies.token (if you use cookies)
 *  - req.query.token (useful for testing but avoid in production)
 *
 * On success: attaches req.user (user document without password) and calls next()
 * On failure: returns 401 with a helpful message.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1) Authorization header: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2) Cookie (optional)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 3) Query (optional - avoid in production)
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    // Verify token (throws on invalid/expired)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded should include the user id (e.g., { id, iat, exp })
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Fetch user by id and exclude password
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Token invalid: user not found" });
    }

    // Attach user to request for downstream middleware/controllers
    req.user = user;
    next();
  } catch (err) {
    // Provide clearer error messages for common JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Not authorized" });
  }
};