import { Router } from "express";
import {
  markStudentAttendance,
  getStudentAttendance,
  markHuffazAttendance,
  getHuffazAttendance,
  getHuffazAttendanceCount,
} from "../controllers/attendance.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

// Student Attendance
// Huffaz and Admin can mark student attendance
router.post("/student", authorize(["ADMIN", "HUFFAZ"]), markStudentAttendance);
router.get("/student", authorize(["ADMIN", "HUFFAZ"]), getStudentAttendance);

// Huffaz Attendance
// Only Admin can mark Huffaz attendance
router.post("/huffaz", authorize(["ADMIN"]), markHuffazAttendance);
router.get("/huffaz", authorize(["ADMIN"]), getHuffazAttendance);
router.get(
  "/huffaz/:id",
  authorize(["ADMIN,HUFFAZ"]),
  getHuffazAttendanceCount,
);

export default router;
