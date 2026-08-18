import type { Request, Response } from "express";
import { prisma } from "../utils/db.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

export const getMarhalaList = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const marhalas = await prisma.marhala.findMany({
      orderBy: { displayOrder: "asc" },
    });

    res.status(200).json({
      success: true,
      data: marhalas,
    });
  } catch (error: any) {
    console.error("getMarhalaList error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const createMarhalaFeeConfiguration = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
  } catch (error: any) {
    console.error("createMarhalaFeeConfiguration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};
