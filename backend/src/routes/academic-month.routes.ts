import { Router } from "express";
import {
  createAcademicMonth,
  createAcademicPeriod,
  getCurrentAcademicMonth,
} from "../controllers/academic-month.controller.js";

const router = Router();

router.post("/period/create", createAcademicPeriod);
router.get("/current", getCurrentAcademicMonth);
router.post("/month/create", createAcademicMonth);

export default router;
