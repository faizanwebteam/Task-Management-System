/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Message and announcement management APIs
 */

import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  sendMessage,
  getInbox,
  getSentMessages,
  markAsRead,
  deleteMessage
} from "../controllers/messageController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send a message or announcement
 *     description: |
 *       Allows a logged-in user to send a direct message or a broadcast announcement.
 *       - For **direct** messages, provide `receiver` field.
 *       - For **announcement**, omit `receiver` and set `"type": "announcement"`.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - body
 *             properties:
 *               receiver:
 *                 type: string
 *                 description: "Receiver user ID (for direct messages only)"
 *                 example: "64f8b15b30a80e1f40ab45d1"
 *               subject:
 *                 type: string
 *                 example: "Leave Approved"
 *               body:
 *                 type: string
 *                 example: "Your leave request has been approved."
 *               type:
 *                 type: string
 *                 enum: [direct, announcement]
 *                 example: "direct"
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Message created successfully
 *       400:
 *         description: Missing or invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, upload.single("file"), sendMessage);

/**
 * @swagger
 * /api/messages/inbox:
 *   get:
 *     summary: Get all received messages (Inbox)
 *     description: Returns all messages received by the logged-in user, including announcements.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of inbox messages
 */
router.get("/inbox", protect, getInbox);

/**
 * @swagger
 * /api/messages/sent:
 *   get:
 *     summary: Get all sent messages
 *     description: Returns all messages sent by the logged-in user.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sent messages
 */
router.get("/sent", protect, getSentMessages);

/**
 * @swagger
 * /api/messages/{id}/read:
 *   put:
 *     summary: Mark a message as read
 *     description: Marks the specified message as read by the logged-in user.
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message marked as read successfully
 *       404:
 *         description: Message not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id/read", protect, markAsRead);

// New delete route
/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       404:
 *         description: Message not found
 *       403:
 *         description: Not authorized
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", protect, deleteMessage);

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "670fe1ac8b5c9e0012dabc45"
 *         sender:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *           example:
 *             _id: "64f8b15b30a80e1f40ab45d1"
 *             name: "Admin User"
 *             email: "admin@example.com"
 *             role: "admin"
 *         receiver:
 *           type: string
 *           nullable: true
 *           example: "64f8b15b30a80e1f40ab45d2"
 *         subject:
 *           type: string
 *           example: "Meeting Reminder"
 *         body:
 *           type: string
 *           example: "Don't forget about the 3PM HR meeting."
 *         type:
 *           type: string
 *           enum: [direct, announcement]
 *           example: "direct"
 *         read:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export default router;
