import User from "../models/userModel.js";

// @desc    Get logged-in user profile
// @route   GET /api/users/me
// @access  Private
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
};

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, oldPassword, newPassword } = req.body;

    // Update name if provided
    if (name) user.name = name;

    // Update password if oldPassword + newPassword provided
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
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
