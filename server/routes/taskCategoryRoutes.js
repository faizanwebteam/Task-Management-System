import express from "express";
import {
  createTaskCategory,
  getTaskCategories,
  getTaskCategoryById,
  updateTaskCategory,
  deleteTaskCategory,
} from "../controllers/taskCategoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TaskCategories
 *   description: Task category management
 */

/**
 * @swagger
 * /api/task-categories:
 *   get:
 *     summary: Get all task categories
 *     tags: [TaskCategories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of task categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaskCategory'
 *       401:
 *         description: Not authorized / token missing
 *       500:
 *         description: Server error
 */
router.get("/", protect, getTaskCategories);

/**
 * @swagger
 * /api/task-categories:
 *   post:
 *     summary: Create a new task category
 *     tags: [TaskCategories]
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
 *                 example: "App Development"
 *               description:
 *                 type: string
 *                 example: "Tasks related to app development"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskCategory'
 *       400:
 *         description: Validation error / missing name
 *       401:
 *         description: Not authorized / token missing
 *       403:
 *         description: Access denied (insufficient role)
 *       409:
 *         description: Category with this name already exists
 *       500:
 *         description: Server error
 */
router.post("/", protect, authorizeRoles("hr", "admin"), createTaskCategory);

/**
 * @swagger
 * /api/task-categories/{id}:
 *   get:
 *     summary: Get a task category by ID
 *     tags: [TaskCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task category ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskCategory'
 *       400:
 *         description: Invalid category id
 *       401:
 *         description: Not authorized / token missing
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get("/:id", protect, getTaskCategoryById);

/**
 * @swagger
 * /api/task-categories/{id}:
 *   put:
 *     summary: Update a task category
 *     tags: [TaskCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task category ID
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
 *                 example: "Enhancement"
 *               description:
 *                 type: string
 *                 example: "Feature requests and enhancements"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskCategory'
 *       400:
 *         description: Invalid category id or validation error
 *       401:
 *         description: Not authorized / token missing
 *       403:
 *         description: Access denied (insufficient role)
 *       404:
 *         description: Category not found
 *       409:
 *         description: Another category with this name already exists
 *       500:
 *         description: Server error
 */
router.put("/:id", protect, authorizeRoles("hr", "admin"), updateTaskCategory);

/**
 * @swagger
 * /api/task-categories/{id}:
 *   delete:
 *     summary: Delete a task category
 *     tags: [TaskCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task category ID to delete
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
 *       401:
 *         description: Not authorized / token missing
 *       403:
 *         description: Access denied (insufficient role)
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", protect, authorizeRoles("hr", "admin"), deleteTaskCategory);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskCategory:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           example: 654d3f3b3e3a3f3a3f3a3f3a
 *         name:
 *           type: string
 *           example: App Development
 *         description:
 *           type: string
 *           example: Tasks related to app development
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