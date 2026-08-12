import { Router } from "express";
import {
  createFeeCollection,
  updateFeeCollection,
  recordFeePayment,
  getFeeCollections,
  getMonthlySettlements,
  getMonthlySettlementById,
  getFinanceReport,
  getHuffazPayables,
  generateMonthlySettlement,
  addSettlementAdjustment,
  lockMonthlySettlement,
} from "../controllers/finance.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

// Student Fee Collections
router.post("/fee-collections", authorize(["ADMIN"]), createFeeCollection);
router.put("/fee-collections/:id", authorize(["ADMIN"]), updateFeeCollection);
router.post("/fee-payment", authorize(["ADMIN"]), recordFeePayment);
router.get("/fee-collections", authorize(["ADMIN"]), getFeeCollections);

// Monthly Settlements
router.get("/settlements", authorize(["ADMIN"]), getMonthlySettlements);
router.get("/settlements/:id", authorize(["ADMIN"]), getMonthlySettlementById);
router.get("/reports", authorize(["ADMIN"]), getFinanceReport);
router.get("/payables", authorize(["ADMIN"]), getHuffazPayables);
router.post(
  "/settlements/generate",
  authorize(["ADMIN"]),
  generateMonthlySettlement,
);
router.post(
  "/settlements/:settlementId/details/:detailId/adjustments",
  authorize(["ADMIN"]),
  addSettlementAdjustment,
);
router.post(
  "/settlements/:id/lock",
  authorize(["ADMIN"]),
  lockMonthlySettlement,
);

export default router;
