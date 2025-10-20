import Leave from "../models/leaveModel.js";

// ✅ GET all leaves
export const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ POST create a new leave
export const createLeave = async (req, res) => {
  try {
    const { employeeName, leaveType, startDate, endDate, reason, status } = req.body;

    const leave = new Leave({
      employeeName,
      leaveType,
      startDate,
      endDate,
      reason,
      status,
      createdBy: req.user?._id,
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ PUT update leave by ID
export const updateLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!leave) return res.status(404).json({ message: "Leave not found" });
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE leave by ID
export const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });
    res.json({ message: "Leave deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
