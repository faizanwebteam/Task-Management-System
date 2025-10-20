import express from "express";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
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
router.get("/me", protect, authorizeRoles("hr", "user"), getUserProfile);

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
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put("/profile", protect, authorizeRoles("hr", "user"), updateUserProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (HR only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get("/", protect, authorizeRoles("hr"), getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (HR only)
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
router.delete("/:id", protect, authorizeRoles("hr"), deleteUser);

export default router;
