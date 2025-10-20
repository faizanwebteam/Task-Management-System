import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    members: [{ type: String }], // Array of member names or IDs
    startDate: { type: Date },
    deadline: { type: Date },
    client: { type: String },
    status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
