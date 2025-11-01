import express from "express";
import {
  createMasterCategory,
  getMasterCategories,
  getMasterCategoryById,
  updateMasterCategory,
  deleteMasterCategory,
} from "../controllers/masterCategoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MasterCategories
 *   description: Master category management
 */

/**
 * @swagger
 * /api/master-categories:
 *   get:
 *     summary: Get all master categories (visible to all authenticated users)
 *     tags: [MasterCategories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of master categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MasterCategory'
 *       401:
 *         description: Not authorized / token missing
 */
router.get("/", protect, getMasterCategories);

/**
 * @swagger
 * /api/master-categories:
 *   post:
 *     summary: Create a new master category (HR/Admin only)
 *     tags: [MasterCategories]
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
 *                 example: "Software Development"
 *               description:
 *                 type: string
 *                 example: "Tasks related to software development"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterCategory'
 *       400:
 *         description: Validation error / missing name
 *       403:
 *         description: Access denied (insufficient role)
 *       409:
 *         description: Category with this name already exists
 */
router.post("/", protect, authorizeRoles("hr", "admin"), createMasterCategory);

/**
 * @swagger
 * /api/master-categories/{id}:
 *   get:
 *     summary: Get a master category by ID (visible to all authenticated users)
 *     tags: [MasterCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Master category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterCategory'
 *       400:
 *         description: Invalid category id
 *       404:
 *         description: Category not found
 */
router.get("/:id", protect, getMasterCategoryById);

/**
 * @swagger
 * /api/master-categories/{id}:
 *   put:
 *     summary: Update a master category (HR/Admin only)
 *     tags: [MasterCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "IT Support / Helpdesk"
 *               description:
 *                 type: string
 *                 example: "Support and helpdesk tasks"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MasterCategory'
 *       400:
 *         description: Invalid category id or validation error
 *       403:
 *         description: Access denied (insufficient role)
 *       404:
 *         description: Category not found
 *       409:
 *         description: Another category with this name already exists
 */
router.put("/:id", protect, authorizeRoles("hr", "admin"), updateMasterCategory);

/**
 * @swagger
 * /api/master-categories/{id}:
 *   delete:
 *     summary: Delete a master category (HR/Admin only)
 *     tags: [MasterCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Category deleted
 *       400:
 *         description: Invalid category id
 *       403:
 *         description: Access denied (insufficient role)
 *       404:
 *         description: Category not found
 */
router.delete("/:id", protect, authorizeRoles("hr", "admin"), deleteMasterCategory);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     MasterCategory:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           example: 654d3f3b3e3a3f3a3f3a3f3a
 *         name:
 *           type: string
 *           example: "Software Development"
 *         description:
 *           type: string
 *           example: "Tasks related to software development"
 *         createdBy:
 *           type: string
 *           description: User ID who created the category
 *           example: 1234567890abcdef12345678
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-10-13T10:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-10-14T11:00:00.000Z
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */