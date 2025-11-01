// controllers/ticketController.js

import Ticket from "../models/ticketModel.js";

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private (HR or logged-in user)
export const createTicket = async (req, res) => {
  try {
    const ticket = new Ticket({
      ...req.body,
      createdBy: req.user._id,
    });
    const savedTicket = await ticket.save();
    res.status(201).json(savedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tickets with optional filters
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req, res) => {
  try {
    const { status, agent, project, search } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (agent) filter.agent = agent;
    if (project) filter.project = project;
    if (search) filter.subject = { $regex: search, $options: "i" };

    const tickets = await Ticket.find(filter)
      .populate("agent", "name email role")
      .populate("project", "name code")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single ticket
// @route   GET /api/tickets/:id
// @access  Private
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("agent", "name email role")
      .populate("project", "name code");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
export const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    Object.assign(ticket, req.body);
    const updatedTicket = await ticket.save();

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private (HR/admin)
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    await ticket.deleteOne();
    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
