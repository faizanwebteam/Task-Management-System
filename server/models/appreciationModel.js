import mongoose from "mongoose";

const appreciationSchema = mongoose.Schema(
  {
    employee: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    givenBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Appreciation = mongoose.model("Appreciation", appreciationSchema);

export default Appreciation;
