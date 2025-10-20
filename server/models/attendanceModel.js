import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  clockInTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  clockOutTime: {
    type: Date,
    default: null,
  },
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
