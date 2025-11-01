import express from "express";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  getEmployees,
} from "../controllers/userController.js";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profile APIs
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get logged-in user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
// anyone authenticated can fetch their own profile
router.get("/me", protect, getUserProfile);

/**
 * @swagger
 * /api/users/employees:
 *   get:
 *     summary: Get all employees (any role can access)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of employees
 */
router.get("/employees", protect, getEmployees); // anyone logged in can access

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update logged-in user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               oldPassword:
 *                 type: string
 *                 example: password123
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *               mob:
 *                 type: string
 *                 example: "+1234567890"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: male
 *               country:
 *                 type: string
 *                 example: USA
 *     responses:
 *       200:
 *         description: User updated successfully
 */
// allow any authenticated user to update their own profile
router.put("/profile", protect, updateUserProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (HR or Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
// only HR and Admin can list all users
router.get("/", protect, authorizeRoles("hr", "admin"), getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (HR or Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
// only HR and Admin can delete users
router.delete("/:id", protect, authorizeRoles("hr", "admin"), deleteUser);

export default router;