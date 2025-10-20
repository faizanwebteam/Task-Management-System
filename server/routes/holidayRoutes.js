import express from "express";
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "../controllers/holidayController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Holidays
 *   description: Employee holiday management APIs
 */

/**
 * @swagger
 * /api/holidays:
 *   get:
 *     summary: Get all holidays
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of holidays
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Holiday'
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, authorizeRoles("hr", "user"), getHolidays);

/**
 * @swagger
 * /api/holidays:
 *   post:
 *     summary: Create a new holiday
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHoliday'
 *     responses:
 *       201:
 *         description: Holiday created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Holiday'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, authorizeRoles("hr"), createHoliday);

/**
 * @swagger
 * /api/holidays/{id}:
 *   put:
 *     summary: Update a holiday
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Holiday ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHoliday'
 *     responses:
 *       200:
 *         description: Holiday updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Holiday'
 *       404:
 *         description: Holiday not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", protect, authorizeRoles("hr"), updateHoliday);

/**
 * @swagger
 * /api/holidays/{id}:
 *   delete:
 *     summary: Delete a holiday
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Holiday ID
 *     responses:
 *       200:
 *         description: Holiday deleted successfully
 *       404:
 *         description: Holiday not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", protect, authorizeRoles("hr"), deleteHoliday);

export default router;

/**
 * @swagger 
 *components:
 *  schemas:
 *    Holiday:
 *      type: object
 *      required:
 *        - name
 *        - date
 *      properties:
 *        _id:
 *          type: string
 *        name:
 *          type: string
 *        date:
 *          type: string
 *          format: date
 *        type:
 *          type: string
 *          enum: ["Public", "Optional"]
 *        description:
 *          type: string
 *        status:
 *          type: string
 *          enum: ["Active", "Inactive"]
 *        createdAt:
 *          type: string
 *          format: date-time
 *        updatedAt:
 *          type: string
 *          format: date-time
 *
 *    CreateHoliday:
 *      type: object
 *      required:
 *        - name
 *        - date
 *      properties:
 *        name:
 *          type: string
 *        date:
 *          type: string
 *          format: date
 *        type:
 *          type: string
 *          enum: ["Public", "Optional"]
 *        description:
 *          type: string
 *        status:
 *          type: string
 *          enum: ["Active", "Inactive"]
 *
*/          
 