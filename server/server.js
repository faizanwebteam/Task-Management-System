import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import swaggerDocs from "./swagger/swaggerConfig.js";
import cors from "cors";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import autoClockOut from "./utils/autoClockOut.js";
import projectRoutes from "./routes/projectRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import holidayRoutes from "./routes/holidayRoutes.js";
import appreciationRoutes from "./routes/appreciationRoutes.js";


dotenv.config();
connectDB();

const app = express();

// ✅ Correct CORS setup
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/leaves", leaveRoutes)
app.use("/api/holidays", holidayRoutes)
app.use("/api/appreciations", appreciationRoutes);

// Start cron job
autoClockOut();

// Swagger
swaggerDocs(app, process.env.PORT || 5000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
