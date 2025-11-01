import User from "../models/userModel.js";

// @desc Get all users (HR or Admin only)
export const getAllUsers = async (req, res) => {
  try {
    // allow HR and Admin only
    if (!req.user || (req.user.role !== "hr" && req.user.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all employees (for ticket assignment)
// any authenticated user can call this, and include admin/hr in the returned list so they
// can also be available for assignment if desired
export const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({
      role: { $in: ["user", "employee", "hr", "admin"] },
    }).select("-password");
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get logged-in user's profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update logged-in user's profile
export const updateUserProfile = async (req, res) => {
  try {
    // Need password for comparing oldPassword; select it explicitly
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      name,
      oldPassword,
      newPassword,
      mob,
      dob,
      gender,
      country,
    } = req.body;

    // Update basic fields
    if (name) user.name = name;
    if (mob) user.mob = mob;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;
    if (country) user.country = country;

    // Update password if provided
    if (oldPassword && newPassword) {
      const isMatch = await user.matchPassword(oldPassword);
      if (!isMatch)
        return res.status(400).json({ message: "Old password is incorrect" });

      user.password = newPassword; // pre-save hook hashes it
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      mob: updatedUser.mob || "",
      dob: updatedUser.dob || "",
      gender: updatedUser.gender || "",
      country: updatedUser.country || "",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc HR/Admin delete a user
export const deleteUser = async (req, res) => {
  try {
    // allow HR and Admin only
    if (!req.user || (req.user.role !== "hr" && req.user.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};