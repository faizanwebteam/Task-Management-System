import mongoose from "mongoose";

const masterCategorySchema = new mongoose.Schema(
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

// Case-insensitive unique index for name (helpful for duplicates)
masterCategorySchema.index({ name: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

const MasterCategory = mongoose.model("MasterCategory", masterCategorySchema);

export default MasterCategory;