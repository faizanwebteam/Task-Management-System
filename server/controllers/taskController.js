import mongoose from "mongoose";
import Task from "../models/taskModel.js";

// Helper: check ownership or HR/Admin (if you have roles in req.user)
const canModifyTask = (reqUser, taskUserId) => {
  if (!reqUser) return false;
  if (reqUser.role === "hr" || reqUser.role === "admin") return true;
  return String(taskUserId) === String(reqUser._id);
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      category, // optional: ObjectId of TaskCategory
      project, // optional: ObjectId of Project
      assignedTo, // optional: ObjectId of User
      startDate,
      dueDate,
      status,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Validate optional ObjectId fields
    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category id" });
    }
    if (project && !mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({ message: "Invalid project id" });
    }
    if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ message: "Invalid assignedTo user id" });
    }

    const payload = {
      title: title.trim(),
      description: description || "",
      user: req.user._id,
      category: category || null,
      project: project || null,
      assignedTo: assignedTo || null,
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: status || "pending",
    };

    const task = await Task.create(payload);

    // Populate relations for response
    const populated = await Task.findById(task._id)
      .populate("category", "name")
      .populate("project", "name code")
      .populate("assignedTo", "name email role");

    res.status(201).json(populated);
  } catch (error) {
    console.error("createTask error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks for logged-in user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    // HR/admin might want all tasks; if so, change this logic as needed.
    const filter = req.user.role === "hr" || req.user.role === "admin"
      ? {}
      : { user: req.user._id };

    const tasks = await Task.find(filter)
      .populate("category", "name")
      .populate("project", "name code")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("getTasks error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const task = await Task.findById(id)
      .populate("category", "name")
      .populate("project", "name code")
      .populate("assignedTo", "name email role");

    if (!task) return res.status(404).json({ message: "Task not found" });

    // enforce ownership unless HR/admin
    if (!(req.user.role === "hr" || req.user.role === "admin") && String(task.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(task);
  } catch (error) {
    console.error("getTaskById error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!canModifyTask(req.user, task.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const {
      title,
      description,
      status,
      category,
      project,
      assignedTo,
      startDate,
      dueDate,
    } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    if (category !== undefined) {
      if (category && !mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ message: "Invalid category id" });
      }
      task.category = category || null;
    }

    if (project !== undefined) {
      if (project && !mongoose.Types.ObjectId.isValid(project)) {
        return res.status(400).json({ message: "Invalid project id" });
      }
      task.project = project || null;
    }

    if (assignedTo !== undefined) {
      if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({ message: "Invalid assignedTo user id" });
      }
      task.assignedTo = assignedTo || null;
    }

    if (startDate !== undefined) task.startDate = startDate ? new Date(startDate) : null;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedTask = await task.save();

    const populated = await Task.findById(updatedTask._id)
      .populate("category", "name")
      .populate("project", "name code")
      .populate("assignedTo", "name email role");

    res.json(populated);
  } catch (error) {
    console.error("updateTask error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!canModifyTask(req.user, task.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Task.deleteOne({ _id: task._id });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("deleteTask error:", error);
    res.status(500).json({ message: error.message });
  }
};

// START TIMER
export const startTime = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid task id" });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!canModifyTask(req.user, task.user)) return res.status(403).json({ message: "Access denied" });

    if (task.activeTimer) {
      return res.status(200).json({
        message: "Timer already running",
        activeTimer: task.activeTimer,
        totalTime: task.totalTimeSpent,
        running: true,
        paused: false,
      });
    }

    task.activeTimer = new Date();
    task.paused = false;
    task.timerRunning = true;

    task.sessions = task.sessions || [];
    task.sessions.push({ startTime: task.activeTimer, endTime: null });

    await task.save();

    res.status(200).json({
      message: "Timer started",
      activeTimer: task.activeTimer,
      totalTime: task.totalTimeSpent,
      running: true,
      paused: false,
    });
  } catch (error) {
    console.error("startTime error:", error);
    res.status(500).json({ message: error.message });
  }
};

// PAUSE TIMER
export const pauseTime = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid task id" });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!canModifyTask(req.user, task.user)) return res.status(403).json({ message: "Access denied" });

    if (!task.activeTimer) return res.status(400).json({ message: "Timer not running" });

    const elapsed = Math.floor((Date.now() - new Date(task.activeTimer)) / 1000) || 0;

    task.totalTimeSpent += elapsed;
    task.activeTimer = null;
    task.paused = true;
    task.timerRunning = false;

    if (task.sessions && task.sessions.length > 0) {
      const last = task.sessions[task.sessions.length - 1];
      if (last && !last.endTime) last.endTime = new Date();
    }

    await task.save();

    res.status(200).json({
      message: "Timer paused",
      totalTime: task.totalTimeSpent,
      running: false,
      paused: true,
    });
  } catch (error) {
    console.error("pauseTime error:", error);
    res.status(500).json({ message: error.message });
  }
};

// RESUME TIMER
export const resumeTime = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid task id" });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!canModifyTask(req.user, task.user)) return res.status(403).json({ message: "Access denied" });

    if (!task.paused) return res.status(400).json({ message: "Task not paused" });

    task.activeTimer = new Date();
    task.paused = false;
    task.timerRunning = true;

    task.sessions = task.sessions || [];
    task.sessions.push({ startTime: task.activeTimer, endTime: null });

    await task.save();

    res.status(200).json({
      message: "Timer resumed",
      activeTimer: task.activeTimer,
      totalTime: task.totalTimeSpent,
      running: true,
      paused: false,
    });
  } catch (error) {
    console.error("resumeTime error:", error);
    res.status(500).json({ message: error.message });
  }
};

// STOP TIMER
export const stopTime = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid task id" });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!canModifyTask(req.user, task.user)) return res.status(403).json({ message: "Access denied" });

    let elapsed = 0;
    if (task.activeTimer) {
      elapsed = Math.floor((Date.now() - new Date(task.activeTimer)) / 1000) || 0;
      task.totalTimeSpent += elapsed;
    }

    task.activeTimer = null;
    task.timerRunning = false;
    task.paused = false;
    task.status = "completed";

    if (task.sessions && task.sessions.length > 0) {
      const last = task.sessions[task.sessions.length - 1];
      if (last && !last.endTime) last.endTime = new Date();
    }

    await task.save();

    res.status(200).json({
      message: "Timer stopped",
      totalTime: task.totalTimeSpent,
      running: false,
      paused: false,
    });
  } catch (error) {
    console.error("stopTime error:", error);
    res.status(500).json({ message: error.message });
  }
};