import { Router } from "express";
import { getMarhalaList } from "../controllers/marhala.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", authorize(["ADMIN", "HUFFAZ"]), getMarhalaList);

export default router;
