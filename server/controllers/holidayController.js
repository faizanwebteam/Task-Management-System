import Holiday from "../models/holidayModel.js";

// Get all holidays
export const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.status(200).json(holidays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new holiday
export const createHoliday = async (req, res) => {
  try {
    const { name, date, type, description, status } = req.body;
    const holiday = new Holiday({ name, date, type, description, status });
    await holiday.save();
    res.status(201).json(holiday);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a holiday
export const updateHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) return res.status(404).json({ message: "Holiday not found" });

    const { name, date, type, description, status } = req.body;
    holiday.name = name ?? holiday.name;
    holiday.date = date ?? holiday.date;
    holiday.type = type ?? holiday.type;
    holiday.description = description ?? holiday.description;
    holiday.status = status ?? holiday.status;

    await holiday.save();
    res.status(200).json(holiday);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a holiday
export const deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) return res.status(404).json({ message: "Holiday not found" });

    res.status(200).json({ message: "Holiday deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
