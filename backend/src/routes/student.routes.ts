import { Router } from "express";
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all student routes
router.use(authenticate);

router.get("/", getStudents);
router.get("/:studentId", getStudentById);

// Only ADMIN and HUFFAZ can create/update students based on specs, but let's restrict creating to ADMIN or just let both do it as per req.
// 01-Requirements.md says: "Huffaz and Admin shall be able to: Add Student, Update Student, Delete Student"
router.post("/", authorize(["ADMIN", "HUFFAZ"]), createStudent);
router.put("/:studentId", authorize(["ADMIN", "HUFFAZ"]), updateStudent);
router.delete("/:studentId", authorize(["ADMIN", "HUFFAZ"]), deleteStudent);

export default router;
