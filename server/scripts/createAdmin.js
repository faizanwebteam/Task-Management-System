import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/userModel.js";

dotenv.config();

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("Please set MONGO_URI in your environment (.env)");
    process.exit(1);
  }

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin";

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Admin already exists: ${email}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const user = new User({
      name,
      email,
      password,
      role: "admin",
    });

    await user.save();
    console.log(`Admin created: ${email}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Failed to create admin:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();