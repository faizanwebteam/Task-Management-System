import Task from "../models/taskModel.js";

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    const task = await Task.create({
      title,
      description,
      user: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks for logged-in user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { title, description, status } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Task.deleteOne({ _id: task._id });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/taskController.js

// START TIMER
export const startTime = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // If already running, return current state to keep UI in sync
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

    // Start a new session
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
    res.status(500).json({ message: error.message });
  }
};

// PAUSE TIMER
export const pauseTime = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!task.activeTimer)
      return res.status(400).json({ message: "Timer not running" });

    const elapsed =
      Math.floor((Date.now() - new Date(task.activeTimer)) / 1000) || 0;

    task.totalTimeSpent += elapsed;
    task.activeTimer = null;
    task.paused = true;
    task.timerRunning = false;

    // Close latest session
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
    res.status(500).json({ message: error.message });
  }
};

// STOP TIMER
export const stopTime = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    let elapsed = 0;
    if (task.activeTimer) {
      elapsed =
        Math.floor((Date.now() - new Date(task.activeTimer)) / 1000) || 0;
      task.totalTimeSpent += elapsed;
    }

    task.activeTimer = null;
    task.timerRunning = false;
    task.paused = false;
    task.status = "completed";

    // Close latest session if open
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
    res.status(500).json({ message: error.message });
  }
};
