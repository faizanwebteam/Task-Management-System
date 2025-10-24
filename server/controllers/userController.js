import User from "../models/userModel.js";

// @desc Get all users (HR only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
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

    const { name, oldPassword, newPassword } = req.body;

    if (name) user.name = name;

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
      role: updatedUser.role, // include role in response
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc HR delete a user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
