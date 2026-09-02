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

export const getMarhalaFeeConfigurations = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { academicPeriodId } = req.query;

    let whereClause = {};
    if (academicPeriodId) {
      whereClause = { academicPeriodId: academicPeriodId as string };
    }

    const configs = await prisma.marhalaFeeConfiguration.findMany({
      where: whereClause,
      include: {
        marhala: true,
        academicPeriod: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: configs,
    });
  } catch (error: any) {
    console.error("getMarhalaFeeConfigurations error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const createMarhalaFeeConfiguration = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      academicPeriodId,
      marhalaId,
      monthlyFee,
      effectiveFrom,
      effectiveTo,
      isActive,
    } = req.body;
    const createdBy = req.user?.userId;

    // Check if configuration already exists for this period and marhala
    const existing = await prisma.marhalaFeeConfiguration.findFirst({
      where: { academicPeriodId, marhalaId },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message:
          "Fee configuration already exists for this Marhala in the given Academic Period.",
      });
      return;
    }

    const newConfig = await prisma.marhalaFeeConfiguration.create({
      data: {
        academicPeriodId,
        marhalaId,
        monthlyFee,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        isActive: isActive !== undefined ? isActive : true,
        createdBy,
      },
      include: {
        marhala: true,
        academicPeriod: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Fee configuration created successfully",
      data: newConfig,
    });
  } catch (error: any) {
    console.error("createMarhalaFeeConfiguration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const updateMarhalaFeeConfiguration = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { monthlyFee, effectiveFrom, effectiveTo, isActive } = req.body;
    const updatedBy = req.user?.userId;

    const updatedConfig = await prisma.marhalaFeeConfiguration.update({
      where: { id },
      data: {
        ...(monthlyFee !== undefined && { monthlyFee }),
        ...(effectiveFrom && { effectiveFrom: new Date(effectiveFrom) }),
        ...(effectiveTo !== undefined && {
          effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        }),
        ...(isActive !== undefined && { isActive }),
        updatedBy,
      },
      include: {
        marhala: true,
        academicPeriod: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Fee configuration updated successfully",
      data: updatedConfig,
    });
  } catch (error: any) {
    console.error("updateMarhalaFeeConfiguration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const deleteMarhalaFeeConfiguration = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedBy = req.user?.userId;

    await prisma.marhalaFeeConfiguration.update({
      where: { id },
      data: {
        isActive: false,
        updatedBy,
      },
    });

    res.status(200).json({
      success: true,
      message: "Fee configuration deactivated successfully",
    });
  } catch (error: any) {
    console.error("deleteMarhalaFeeConfiguration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
