import cron from "node-cron";
import Attendance from "../models/attendanceModel.js";

const autoClockOut = () => {
  // Schedule the job at 7:00 PM every day
  cron.schedule("0 19 * * *", async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find all attendances for today where clockOut is still null
      const attendances = await Attendance.find({
        clockIn: { $gte: today }, // Clock-in anytime today
        clockOut: null,
      });

      for (let record of attendances) {
        record.clockOut = new Date(today.setHours(19, 0, 0, 0)); // 7:00 PM
        record.status = "auto-clocked-out"; // optional flag
        await record.save();
      }

      console.log(`Auto clock-out completed for ${attendances.length} users at 7 PM`);
    } catch (error) {
      console.error("Error in auto clock-out:", error);
    }
  });
};

export default autoClockOut;
