import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employeeName: { type: String, required: true },
    leaveType: {
      type: String,
      enum: ["Sick Leave", "Casual Leave", "Earned Leave", "Unpaid Leave"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;
