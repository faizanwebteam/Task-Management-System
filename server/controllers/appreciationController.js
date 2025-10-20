import Appreciation from "../models/appreciationModel.js";

// @desc Get all appreciations
// @route GET /api/appreciations
// @access Private
export const getAppreciations = async (req, res) => {
  try {
    const appreciations = await Appreciation.find().sort({ date: -1 });
    res.status(200).json(appreciations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create a new appreciation
// @route POST /api/appreciations
// @access Private
export const createAppreciation = async (req, res) => {
  try {
    const { employee, message, date, givenBy } = req.body;
    const appreciation = await Appreciation.create({ employee, message, date, givenBy });
    res.status(201).json(appreciation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update an appreciation
// @route PUT /api/appreciations/:id
// @access Private
export const updateAppreciation = async (req, res) => {
  try {
    const appreciation = await Appreciation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!appreciation) return res.status(404).json({ message: "Appreciation not found" });
    res.status(200).json(appreciation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete an appreciation
// @route DELETE /api/appreciations/:id
// @access Private
export const deleteAppreciation = async (req, res) => {
  try {
    const appreciation = await Appreciation.findByIdAndDelete(req.params.id);
    if (!appreciation) return res.status(404).json({ message: "Appreciation not found" });
    res.status(200).json({ message: "Appreciation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
