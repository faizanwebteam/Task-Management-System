// routes/ticketRoutes.js
import express from "express";
import {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  getTicketById
} from "../controllers/ticketController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management APIs
 */

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Get all tickets
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ticket'
 */
router.get("/", protect, authorizeRoles("hr", "user"), getTickets);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get a ticket by ID
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Ticket ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 */
router.get("/:id", protect, authorizeRoles("hr", "user"), getTicketById);

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ticket'
 *     responses:
 *       201:
 *         description: Ticket created successfully
 */
router.post("/", protect, authorizeRoles("hr", "user"), createTicket);

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Update a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Ticket ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ticket'
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *
 *   delete:
 *     summary: Delete a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Ticket ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 */
router.route("/:id")
  .put(protect, authorizeRoles("hr"), updateTicket)
  .delete(protect, authorizeRoles("hr"), deleteTicket);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       required:
 *         - subject
 *         - requesterName
 *         - status
 *       properties:
 *         subject:
 *           type: string
 *           example: "Website Bug"
 *         requesterName:
 *           type: string
 *           example: "John Doe"
 *         description:
 *           type: string
 *           example: "The submit button is not working on form."
 *         project:
 *           type: string
 *           example: "PRJ001"
 *         priority:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *           example: "High"
 *         channel:
 *           type: string
 *           example: "Email"
 *         type:
 *           type: string
 *           enum: [Issue, Request, Incident, Task]
 *           example: "Issue"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["frontend", "urgent"]
 *         status:
 *           type: string
 *           enum: [Open, Pending, Resolved, Closed]
 *           example: "Open"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
