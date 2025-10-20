import express from "express";
import {
  getLeaves,
  createLeave,
  updateLeave,
  deleteLeave,
} from "../controllers/leaveController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Leaves
 *   description: Employee leave management APIs
 */

/**
 * @swagger
 * /api/leaves:
 *   get:
 *     summary: Get all leaves
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all leaves
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Leave'
 *
 *   post:
 *     summary: Create a new leave
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeaveInput'
 *     responses:
 *       201:
 *         description: Leave created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Leave'
 */

/**
 * @swagger
 * /api/leaves/{id}:
 *   put:
 *     summary: Update a leave
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Leave ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeaveInput'
 *     responses:
 *       200:
 *         description: Leave updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Leave'
 *
 *   delete:
 *     summary: Delete a leave
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Leave ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leave deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 message: Leave deleted successfully
 */

router.route("/")
  .get(protect, authorizeRoles("hr", "user"), getLeaves)
  .post(protect, authorizeRoles("hr", "user"), createLeave);

router.route("/:id")
  .put(protect, authorizeRoles("hr"), updateLeave)
  .delete(protect,authorizeRoles("hr"), deleteLeave);

export default router;

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Leave:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6710e12acb6a2b4d98f0c123
 *         employeeName:
 *           type: string
 *           example: John Doe
 *         leaveType:
 *           type: string
 *           enum: [Sick Leave, Casual Leave, Earned Leave, Unpaid Leave]
 *           example: Sick Leave
 *         startDate:
 *           type: string
 *           format: date
 *           example: 2025-10-17
 *         endDate:
 *           type: string
 *           format: date
 *           example: 2025-10-20
 *         reason:
 *           type: string
 *           example: Fever and rest
 *         status:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *           example: Pending
 *         createdBy:
 *           type: string
 *           example: 6710dff8a9d3e6c2b4561234
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     LeaveInput:
 *       type: object
 *       required:
 *         - employeeName
 *         - leaveType
 *         - startDate
 *         - endDate
 *       properties:
 *         employeeName:
 *           type: string
 *           example: Jane Smith
 *         leaveType:
 *           type: string
 *           enum: [Sick Leave, Casual Leave, Earned Leave, Unpaid Leave]
 *           example: Casual Leave
 *         startDate:
 *           type: string
 *           format: date
 *           example: 2025-11-01
 *         endDate:
 *           type: string
 *           format: date
 *           example: 2025-11-03
 *         reason:
 *           type: string
 *           example: Family event
 *         status:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *           example: Pending
 */
