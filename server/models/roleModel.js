import mongoose from "mongoose";

const roleSchema = mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g., "admin", "hr", "user"
    description: { type: String },
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);
export default Role;
