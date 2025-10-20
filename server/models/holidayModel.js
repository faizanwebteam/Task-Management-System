import mongoose from "mongoose";

const holidaySchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ["Public", "Optional"], default: "Public" },
    description: { type: String },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

const Holiday = mongoose.model("Holiday", holidaySchema);

export default Holiday;
