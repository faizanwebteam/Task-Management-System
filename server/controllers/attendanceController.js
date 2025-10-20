import Attendance from "../models/attendanceModel.js";

// @desc Clock in
// @route POST /api/attendance/clockin
// @access Private
export const clockIn = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user is already clocked in (last record without clockOutTime)
    const lastAttendance = await Attendance.findOne({ user: userId }).sort({ clockInTime: -1 });
    if (lastAttendance && !lastAttendance.clockOutTime) {
      return res.status(400).json({ message: "Already clocked in" });
    }

    const attendance = await Attendance.create({ user: userId });
    res.status(201).json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Clock out
// @route POST /api/attendance/clockout
// @access Private
export const clockOut = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find last clock-in record without clockOutTime
    const attendance = await Attendance.findOne({ user: userId, clockOutTime: null }).sort({ clockInTime: -1 });
    if (!attendance) {
      return res.status(400).json({ message: "Not clocked in" });
    }

    attendance.clockOutTime = new Date();
    await attendance.save();

    res.status(200).json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get last attendance
// @route GET /api/attendance/last
// @access Private
export const getLastAttendance = async (req, res) => {
  try {
    const userId = req.user._id;
    const lastAttendance = await Attendance.findOne({ user: userId }).sort({ clockInTime: -1 });
    if (!lastAttendance) return res.status(404).json({ message: "No attendance found" });
    res.status(200).json(lastAttendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all attendance history for logged-in user
// @route   GET /api/attendance/history
// @access  Private
export const getAttendanceHistory = async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user._id }).sort({ clockInTime: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    res.status(500).json({ message: "Server error fetching attendance history" });
  }
};
