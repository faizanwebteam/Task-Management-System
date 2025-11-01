import Client from "../models/clientModel.js";

// Get all clients
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ name: 1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new client
export const createClient = async (req, res) => {
  try {
    const { name, email, company, phone } = req.body;
    const existing = await Client.findOne({ email });
    if (existing) return res.status(400).json({ message: "Client already exists" });

    const client = await Client.create({ name, email, company, phone });
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
