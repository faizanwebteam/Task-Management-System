import mongoose from "mongoose";

const ticketSchema = mongoose.Schema(
  {
    subject: { type: String, required: true },

    // New: single requester with type
    requesterType: { type: String, enum: ["client", "employee"], required: true },
    requesterName: { type: String, required: true },

    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // assigned HR or support
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    channel: { type: String }, // e.g., Email, Chat, Phone
    type: { type: String }, // Bug, Request, etc.
    tags: [{ type: String }],
    status: { type: String, enum: ["Open", "Pending", "Resolved", "Closed"], default: "Open" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
