// routes/taskRoutes.js

import express from "express";
const router = express.Router();
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  startTime,
  stopTime,
  pauseTime,
  resumeTime
} from "../controllers/taskController.js";

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Finish homework
 *               description:
 *                 type: string
 *                 example: Math and Science homework
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid task data
 */
router.post("/", protect, authorizeRoles("hr", "user"), createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for the logged-in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get("/", protect, authorizeRoles("hr", "user"), getTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Task ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task deleted successfully
 *       404:
 *         description: Task not found
 */
router.delete("/:id", protect, authorizeRoles("hr", "user"), deleteTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
router.get("/:id", protect, authorizeRoles("hr", "user"), getTaskById);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Finish homework
 *               description:
 *                 type: string
 *                 example: Math and Science homework
 *               status:
 *                 type: string
 *                 enum: [pending, completed]
 *                 example: completed
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
router.put("/:id", protect, authorizeRoles("hr", "user"), updateTask);

export default router;

/**
 * @swagger
 * /api/tasks/{id}/starttime:
 *   put:
 *     summary: Start timer for a task (Start Time)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID to start timer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timer started successfully
 *       400:
 *         description: Task not found
 */
router.put("/:id/starttime", protect, authorizeRoles("hr", "user"), startTime);

/**
 * @swagger
 * /api/tasks/{id}/stoptime:
 *   put:
 *     summary: Stop timer for a task (Stop Time)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID to stop timer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timer stopped successfully
 *       400:
 *         description: Task not found or timer not active
 */
router.put("/:id/stoptime", protect, authorizeRoles("hr", "user"), stopTime);

/**
 * @swagger
 * /api/tasks/{id}/pausetime:
 *   put:
 *     summary: Pause timer for a task (Pause Time)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID to pause timer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timer paused successfully
 *       400:
 *         description: Task not found or timer not running
 */
router.put("/:id/pausetime", protect, authorizeRoles("hr", "user"), pauseTime);

/**
 * @swagger
 * /api/tasks/{id}/resumetime:
 *   put:
 *     summary: Resume a paused timer for a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Task ID to resume timer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timer resumed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Timer resumed
 *                 activeTimer:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-24T12:34:56.789Z"
 *                 totalTime:
 *                   type: integer
 *                   example: 120
 *                 running:
 *                   type: boolean
 *                   example: true
 *                 paused:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: Task not paused or invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task not paused
 *       401:
 *         description: Not authorized / token missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task not found
 */
router.put("/:id/resumetime", protect, authorizeRoles("hr", "user"), resumeTime);



/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 654d3f3b3e3a3f3a3f3a3f3a
 *         title:
 *           type: string
 *           example: Finish homework
 *         description:
 *           type: string
 *           example: Math and Science homework
 *         status:
 *           type: string
 *           enum: [pending, completed]
 *           example: pending
 *         user:
 *           type: string
 *           example: 1234567890abcdef12345678
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-10-13T10:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-10-13T10:00:00.000Z
 */
