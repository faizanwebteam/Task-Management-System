import mongoose from "mongoose";

const taskCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create a case-insensitive unique index on name (optional, but helpful)
taskCategorySchema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

const TaskCategory = mongoose.model("TaskCategory", taskCategorySchema);

export default TaskCategory;