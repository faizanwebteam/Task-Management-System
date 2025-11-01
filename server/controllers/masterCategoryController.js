import mongoose from "mongoose";
import MasterCategory from "../models/masterCategoryModel.js";

/**
 * Create a new master category
 * POST /api/master-categories
 * Access: HR / Admin only
 */
export const createMasterCategory = async (req, res) => {
  try {
    // defense-in-depth: ensure only hr/admin can create
    if (!req.user || (req.user.role !== "hr" && req.user.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await MasterCategory.findOne({ name: name.trim() }).collation({ locale: "en", strength: 2 });
    if (existing) {
      return res.status(409).json({ message: "Category with this name already exists" });
    }

    const category = new MasterCategory({
      name: name.trim(),
      description: description || "",
      createdBy: req.user?._id,
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error("createMasterCategory error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: "Category with this name already exists" });
    }
    res.status(500).json({ message: "Failed to create category" });
  }
};

/**
 * Get all master categories
 * GET /api/master-categories
 * Access: Any authenticated user (admin/hr/user can view)
 */
export const getMasterCategories = async (req, res) => {
  try {
    const categories = await MasterCategory.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error("getMasterCategories error:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

/**
 * Get single master category by id
 * GET /api/master-categories/:id
 * Access: Any authenticated user
 */
export const getMasterCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const category = await MasterCategory.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.json(category);
  } catch (error) {
    console.error("getMasterCategoryById error:", error);
    res.status(500).json({ message: "Failed to fetch category" });
  }
};

/**
 * Update a master category
 * PUT /api/master-categories/:id
 * Access: HR / Admin only
 */
export const updateMasterCategory = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== "hr" && req.user.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const { name, description } = req.body;
    const category = await MasterCategory.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    if (name !== undefined && name.trim() !== category.name) {
      const existing = await MasterCategory.findOne({ name: name.trim(), _id: { $ne: id } }).collation({ locale: "en", strength: 2 });
      if (existing) return res.status(409).json({ message: "Another category with this name already exists" });
      category.name = name.trim();
    }

    if (description !== undefined) category.description = description;

    await category.save();
    res.json(category);
  } catch (error) {
    console.error("updateMasterCategory error:", error);
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
 * Delete a master category
 * DELETE /api/master-categories/:id
 * Access: HR / Admin only
 */
export const deleteMasterCategory = async (req, res) => {
  try {
    if (!req.user || (req.user.role !== "hr" && req.user.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const category = await MasterCategory.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category deleted" });
  } catch (error) {
    console.error("deleteMasterCategory error:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};