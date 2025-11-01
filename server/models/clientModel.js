import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    company: { type: String },
    phone: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
