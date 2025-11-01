import Leave from "../models/leaveModel.js";

// GET all leaves
export const getLeaves = async (req, res) => {
  try {
    let leaves;

    if (req.user.role === "hr") {
      // HR can see all leaves
      leaves = await Leave.find()
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 });
    } else {
      // Normal user sees only their own leaves
      leaves = await Leave.find({ createdBy: req.user._id })
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 });
    }

    res.status(200).json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching leaves" });
  }
};

// ✅ POST create a new leave
export const createLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, status } = req.body;

    const leave = new Leave({
      employeeName: req.user.name, // automatically use logged-in user name
      leaveType,
      startDate,
      endDate,
      reason,
      status: status || "Pending",
      createdBy: req.user._id, // attach logged-in user
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create leave" });
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
