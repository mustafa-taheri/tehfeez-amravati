import { Router } from "express";
import {
  createHuffaz,
  deleteHuffaz,
  getHuffazById,
  getHuffazList,
  updateHuffaz,
} from "../controllers/huffaz.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/", authorize(["ADMIN"]), getHuffazList);
router.get("/:id", authorize(["ADMIN"]), getHuffazById);
router.post("/", authorize(["ADMIN"]), createHuffaz);
router.put("/:id", authorize(["ADMIN"]), updateHuffaz);
router.delete("/:id", authorize(["ADMIN"]), deleteHuffaz);

export default router;
