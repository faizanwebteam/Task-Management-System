// routes/roleRoutes.js

import express from "express";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { getAllRoles, createRole, deleteRole } from "../controllers/roleController.js";

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management APIs
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get("/", protect, authorizeRoles("admin", "hr"), getAllRoles);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role (Admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: hr
 *               description:
 *                 type: string
 *                 example: Human Resource role
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Validation error / role exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.post("/", protect, authorizeRoles("admin"), createRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Delete a role (Admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Role not found
 */
router.delete("/:id", protect, authorizeRoles("admin"), deleteRole);

export default router;
