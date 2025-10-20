// attendanceRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import {
  clockIn,
  clockOut,
  getLastAttendance,
  getAttendanceHistory,
} from "../controllers/attendanceController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance tracking APIs
 */

/**
 * @swagger
 * /api/attendance/clockin:
 *   post:
 *     summary: Clock in for the logged-in user
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Clock-in recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Already clocked in
 */
router.post("/clockin", authorizeRoles("hr", "user"), protect, clockIn);

/**
 * @swagger
 * /api/attendance/clockout:
 *   post:
 *     summary: Clock out for the logged-in user
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clock-out recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Not clocked in yet
 */
router.post("/clockout", authorizeRoles("hr", "user"), protect, clockOut);

/**
 * @swagger
 * /api/attendance/last:
 *   get:
 *     summary: Get the last attendance record of the logged-in user
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Last attendance record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       404:
 *         description: No attendance record found
 */
router.get("/last", protect, authorizeRoles("hr", "user"), getLastAttendance);

/**
 * @swagger
 * /api/attendance/history:
 *   get:
 *     summary: Get full attendance history of the logged-in user
 *     description: Returns all attendance records (clock-in and clock-out) for the authenticated user.
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched attendance history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceArray'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       500:
 *         description: Server error
 */
router.get("/history", authorizeRoles("hr", "user"), protect, getAttendanceHistory);

export default router;

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT

 *   schemas:
 *     Attendance:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 652ea3f4b1a2ab6e9f123456
 *         user:
 *           type: string
 *           example: 652ea3f4b1a2ab6e9f111111
 *         clockInTime:
 *           type: string
 *           format: date-time
 *           example: 2025-10-16T08:00:00.000Z
 *         clockOutTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: 2025-10-16T17:00:00.000Z
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-10-16T08:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-10-16T17:00:00.000Z

 */
