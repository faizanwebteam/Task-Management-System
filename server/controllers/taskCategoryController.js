import mongoose from "mongoose";
import TaskCategory from "../models/taskCategoryModel.js";

/**
 * Create a new task category
 * POST /api/task-categories
 * Access: HR / admin (route middleware should enforce role; controller also checks for defense-in-depth)
 */
export const createTaskCategory = async (req, res) => {
  try {
    // defense-in-depth role check (adjust roles to your app)
    if (!req.user || (req.user.role !== "hr" && req.user.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Prevent duplicate names (unique index also helps)
    const existing = await TaskCategory.findOne({ name: name.trim() }).collation({ locale: "en", strength: 2 });
    if (existing) {
      return res.status(409).json({ message: "Category with this name already exists" });
    }

    const category = new TaskCategory({
      name: name.trim(),
      description: description || "",
      createdBy: req.user?._id,
    });

    await category.save();

    res.status(201).json(category);
  } catch (error) {
    console.error("createTaskCategory error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    // Duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ message: "Category with this name already exists" });
    }
    res.status(500).json({ message: "Failed to create task category" });
  }
};

/**
 * Get all task categories
 * GET /api/task-categories
 * Access: Private (any authenticated user)
 */
export const getTaskCategories = async (req, res) => {
  try {
    const categories = await TaskCategory.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error("getTaskCategories error:", error);
    res.status(500).json({ message: "Failed to fetch task categories" });
  }
};

/**
 * Get single category by id
 * GET /api/task-categories/:id
 * Access: Private
 */
export const getTaskCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const category = await TaskCategory.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.json(category);
  } catch (error) {
    console.error("getTaskCategoryById error:", error);
    res.status(500).json({ message: "Failed to fetch category" });
  }
};

/**
 * Update category
 * PUT /api/task-categories/:id
 * Access: HR / admin
 */
export const updateTaskCategory = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== "hr" && req.user.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const { name, description } = req.body;

    const category = await TaskCategory.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    if (name !== undefined && name.trim() !== category.name) {
      // check unique name (case-insensitive)
      const existing = await TaskCategory.findOne({ name: name.trim(), _id: { $ne: id } }).collation({ locale: "en", strength: 2 });
      if (existing) {
        return res.status(409).json({ message: "Another category with this name already exists" });
      }
      category.name = name.trim();
    }
    if (description !== undefined) category.description = description;

    await category.save();
    res.json(category);
  } catch (error) {
    console.error("updateTaskCategory error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: "Another category with this name already exists" });
    }
    res.status(500).json({ message: "Failed to update category" });
  }
};

/**
 * Delete category
 * DELETE /api/task-categories/:id
 * Access: HR / admin
 */
export const deleteTaskCategory = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== "hr" && req.user.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const category = await TaskCategory.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deleted" });
  } catch (error) {
    console.error("deleteTaskCategory error:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};