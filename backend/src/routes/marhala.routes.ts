import { Router } from "express";
import { 
  getMarhalaList,
  getMarhalaFeeConfigurations,
  createMarhalaFeeConfiguration,
  updateMarhalaFeeConfiguration,
  deleteMarhalaFeeConfiguration
} from "../controllers/marhala.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", authorize(["ADMIN", "HUFFAZ"]), getMarhalaList);

// Marhala Fee Configurations
router.get("/fee-configs", authorize(["ADMIN"]), getMarhalaFeeConfigurations);
router.post("/fee-configs", authorize(["ADMIN"]), createMarhalaFeeConfiguration);
router.put("/fee-configs/:id", authorize(["ADMIN"]), updateMarhalaFeeConfiguration);
router.delete("/fee-configs/:id", authorize(["ADMIN"]), deleteMarhalaFeeConfiguration);
export default router;
