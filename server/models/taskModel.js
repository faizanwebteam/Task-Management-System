import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },

    // Owner / creator
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Optional references to other collections
    category: { type: mongoose.Schema.Types.ObjectId, ref: "TaskCategory", default: null },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Dates
    startDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },

    // Status & timer fields
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    activeTimer: { type: Date, default: null }, // when the current session started
    totalTimeSpent: { type: Number, default: 0 }, // total seconds
    paused: { type: Boolean, default: false },
    timerRunning: { type: Boolean, default: false },
    sessions: { type: [sessionSchema], default: [] },

    // Misc
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;