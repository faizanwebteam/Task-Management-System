import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

    // Timer fields
    activeTimer: { type: Date },           // stores the start time when timer is running
    totalTimeSpent: { type: Number, default: 0 },
    elapsedSeconds: { type: Number, default: 0 }, // total time elapsed
    timerRunning: { type: Boolean, default: false }, // is timer running
    paused: { type: Boolean, default: false },       // is timer paused
    lastStartTime: { type: Date }, // cumulative time in seconds

    // Track individual sessions for timesheet
    sessions: [
      {
        startTime: { type: Date },
        endTime: { type: Date },
      },
    ],

    // User reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
