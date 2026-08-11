import { Router } from "express";
import { getCurrentAcademicMonth } from "../controllers/academic-month.controller.js";

const router = Router();

router.get("/current", getCurrentAcademicMonth);

export default router;
