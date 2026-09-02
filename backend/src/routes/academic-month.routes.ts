import { Router } from "express";
import {
  createAcademicMonth,
  createAcademicPeriod,
  getAcademicPeriods,
  getAcademicMonthsOfActivePeriod,
  getCurrentAcademicMonth,
  updateAcademicPeriod,
  updateAcademicMonth,
  getAcademicMonths
} from "../controllers/academic-month.controller.js";

const router = Router();

router.get("/periods", getAcademicPeriods);
router.post("/period/create", createAcademicPeriod);
router.put("/period/:id", updateAcademicPeriod);
router.get("/months", getAcademicMonths);
router.put("/month/:id", updateAcademicMonth);
router.get("/current", getCurrentAcademicMonth);
router.post("/month/create", createAcademicMonth);
router.get("/periods/months", getAcademicMonthsOfActivePeriod);

export default router;
