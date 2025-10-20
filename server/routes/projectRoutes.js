import express from "express";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management APIs
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get("/", protect, authorizeRoles("hr", "user"), getProjects);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Project created successfully
 */
router.post("/", protect, authorizeRoles("hr"), createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 */
router.route("/:id")
  .put(protect, authorizeRoles("hr"), updateProject)
  .delete(protect, authorizeRoles("hr"), deleteProject);


export default router;


/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - code
 *         - name
 *       properties:
 *         code:
 *           type: string
 *           example: PRJ001
 *         name:
 *           type: string
 *           example: Website Redesign
 *         members:
 *           type: array
 *           items:
 *             type: string
 *           example: ["John Doe", "Jane Smith"]
 *         startDate:
 *           type: string
 *           format: date
 *           example: 2025-10-17
 *         deadline:
 *           type: string
 *           format: date
 *           example: 2025-12-31
 *         client:
 *           type: string
 *           example: ACME Corp
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *           example: in-progress
 */
