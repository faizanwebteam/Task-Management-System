// middleware/roleMiddleware.js
// Simple role-based authorization middleware.
//
// Usage examples:
//   router.get("/admin", protect, authorizeRoles("admin"), adminHandler);
//   router.get("/hr-or-admin", protect, authorizeRoles("hr", "admin"), handler);
//   // If no roles passed, middleware allows any authenticated user:
//
//   router.get("/any-auth", protect, authorizeRoles(), handler);
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // If no roles were provided, allow any authenticated user
    if (!roles || roles.length === 0) {
      return next();
    }

    const userRole = String(req.user.role || "").toLowerCase();
    const allowed = roles.map((r) => String(r || "").toLowerCase());

    // Special-case: if caller passed '*' allow all authenticated users
    if (allowed.includes("*")) {
      return next();
    }

    if (!allowed.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

export default authorizeRoles;