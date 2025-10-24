// models/userModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Do not return password by default
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "hr"], default: "user" },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  // "this.password" is available because this method is called on a doc that included password
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
