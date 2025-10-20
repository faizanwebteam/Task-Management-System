import express from "express";
import {
  getAppreciations,
  createAppreciation,
  updateAppreciation,
  deleteAppreciation,
} from "../controllers/appreciationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Appreciations
 *   description: Employee appreciation management APIs
 */

/**
 * @swagger
 * /api/appreciations:
 *   get:
 *     summary: Get all appreciations
 *     tags: [Appreciations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appreciations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appreciation'
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, authorizeRoles("hr", "user"), getAppreciations);

/**
 * @swagger
 * /api/appreciations:
 *   post:
 *     summary: Create a new appreciation
 *     tags: [Appreciations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppreciation'
 *     responses:
 *       201:
 *         description: Appreciation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appreciation'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, authorizeRoles("hr"), createAppreciation);

/**
 * @swagger
 * /api/appreciations/{id}:
 *   put:
 *     summary: Update an appreciation
 *     tags: [Appreciations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Appreciation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppreciation'
 *     responses:
 *       200:
 *         description: Appreciation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appreciation'
 *       404:
 *         description: Appreciation not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", protect, authorizeRoles("hr"), updateAppreciation);

/**
 * @swagger
 * /api/appreciations/{id}:
 *   delete:
 *     summary: Delete an appreciation
 *     tags: [Appreciations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Appreciation ID
 *     responses:
 *       200:
 *         description: Appreciation deleted successfully
 *       404:
 *         description: Appreciation not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", protect, authorizeRoles("hr"), deleteAppreciation);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Appreciation:
 *       type: object
 *       required:
 *         - employee
 *         - message
 *         - givenBy
 *       properties:
 *         _id:
 *           type: string
 *         employee:
 *           type: string
 *         message:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         givenBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateAppreciation:
 *       type: object
 *       required:
 *         - employee
 *         - message
 *         - givenBy
 *       properties:
 *         employee:
 *           type: string
 *         message:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         givenBy:
 *           type: string
 */
