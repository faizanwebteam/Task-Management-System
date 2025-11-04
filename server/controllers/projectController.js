// controllers/projectControllers.js

import Project from "../models/projectModel.js";
import User from "../models/userModel.js";

// GET /api/projects - simple list sorted by name
export const getProjectsSortedByName = async (req, res) => {
  try {
    const projects = await Project.find().sort({ name: 1 }); // sorted by project name
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ GET all or user-specific projects
export const getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === "hr") {
      // HR sees all projects
      projects = await Project.find()
        .sort({ createdAt: -1 })
        .populate({ path: "members", select: "name email" })
        .populate({ path: "createdBy", select: "name email" });
    } else {
      // Normal user sees only projects they created or are a member of
      projects = await Project.find({
        $or: [
          { createdBy: req.user._id },
          { members: req.user._id },
        ],
      })
        .sort({ createdAt: -1 })
        .populate({ path: "members", select: "name email" })
        .populate({ path: "createdBy", select: "name email" });
    }

    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

// CREATE new project (HR only)
export const createProject = async (req, res) => {
  try {
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { code, name, members, startDate, deadline, client, status } = req.body;

    let memberIds = [];

    // Check if members are ObjectIds or email/name strings
    if (members && members.length > 0) {
      // Check if first member looks like an ObjectId (24 hex characters)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(members[0]);

      if (isObjectId) {
        // Members are already IDs, use them directly
        memberIds = members;
      } else {
        // Members are names or emails, find the users
        const memberUsers = await User.find({
          $or: [
            { email: { $in: members } },
            { name: { $in: members } },
          ],
        });
        memberIds = memberUsers.map((user) => user._id);
      }
    }

    const project = new Project({
      code,
      name,
      members: memberIds,
      startDate,
      deadline,
      client,
      status,
      createdBy: req.user._id,
    });

    await project.save();

    // Populate members and createdBy before sending response
    await project.populate([
      { path: "members", select: "name email" },
      { path: "createdBy", select: "name email" },
    ]);

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Failed to create project" });
  }
};
// ✅ UPDATE project (HR only)
export const updateProject = async (req, res) => {
  try {
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { code, name, members, startDate, deadline, client, status } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Update fields
    project.code = code ?? project.code;
    project.name = name ?? project.name;
    
    if (members && members.length > 0) {
      // Check if members are ObjectIds or email/name strings
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(members[0]);

      if (isObjectId) {
        // Members are already IDs
        project.members = members;
      } else {
        // Members are names or emails
        const users = await User.find({
          $or: [
            { email: { $in: members } },
            { name: { $in: members } },
          ],
        });
        project.members = users.map((u) => u._id);
      }
    }
    
    project.startDate = startDate ?? project.startDate;
    project.deadline = deadline ?? project.deadline;
    project.client = client ?? project.client;
    project.status = status ?? project.status;

    await project.save();

    // Populate members and createdBy
    await project.populate([
      { path: "members", select: "name email" },
      { path: "createdBy", select: "name email" },
    ]);

    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Failed to update project" });
  }
};

// ✅ DELETE project (HR only)
export const deleteProject = async (req, res) => {
  try {
    if (req.user.role !== "hr") {
      return res.status(403).json({ message: "Access denied" });
    }

    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json({ message: "Project deleted" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Failed to delete project" });
  }
};
