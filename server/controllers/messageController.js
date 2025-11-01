import Message from "../models/messageModel.js";
import multer from "multer";
import path from "path";

// ---------- File Upload Setup ----------
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Middleware to handle file upload
export const uploadMessageFile = upload.single("file");

// ---------- Controllers ----------

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiver, subject, body, type = "direct" } = req.body;
    const file = req.file;

    // Validation
    if (!subject || (!body && !file)) {
      return res.status(400).json({ message: "Subject and body/file are required" });
    }

    if (type !== "announcement" && !receiver) {
      return res.status(400).json({ message: "Receiver is required for direct messages" });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: type === "announcement" ? null : receiver,
      subject,
      body,
      type,
      file: file ? file.filename : null,
    });

    res.status(201).json({ message: "Message sent successfully", data: message });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all messages received by user

export const getInbox = async (req, res) => {
  try {
    let messages;

    if (req.user.role === "hr" || req.user.role === "admin") {
      // HR/Admin: see all messages
      messages = await Message.find()
        .populate("sender", "name email role")
        .populate("receiver", "name email role")
        .sort({ createdAt: -1 });
    } else {
      // Regular user: see only messages where they are receiver or announcements
      messages = await Message.find({
        $or: [{ receiver: req.user._id }, { type: "announcement" }],
      })
        .populate("sender", "name email role")
        .sort({ createdAt: -1 });
    }

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get messages sent by logged-in user
export const getSentMessages = async (req, res) => {
  try {
    let messages;

    if (req.user.role === "hr" || req.user.role === "admin") {
      // HR/Admin: see all sent messages
      messages = await Message.find()
        .populate("sender", "name email role")
        .populate("receiver", "name email role")
        .sort({ createdAt: -1 });
    } else {
      // Regular user: see only messages they sent
      messages = await Message.find({ sender: req.user._id })
        .populate("receiver", "name email role")
        .sort({ createdAt: -1 });
    }

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) return res.status(404).json({ message: "Message not found" });

    message.read = true;
    await message.save();

    res.json({ message: "Message marked as read", data: message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender, HR, or Admin can delete
    if (
      message.sender.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "hr"
    ) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
