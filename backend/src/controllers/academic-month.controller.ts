import type { Request, Response } from "express";
import { prisma } from "../utils/db";

export const getCurrentAcademicMonth = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const academicMonth = await prisma.academicMonth.findFirst({
      where: { isActive: true },
      orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
      include: {
        academicPeriod: {
          select: { id: true, name: true, isCurrent: true },
        },
      },
    });

    if (!academicMonth) {
      res.status(404).json({
        success: false,
        message: "No active academic month found.",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Current academic month retrieved successfully.",
      data: academicMonth,
    });
  } catch (error: any) {
    console.error("getCurrentAcademicMonth error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error.",
        code: "INTERNAL_SERVER_ERROR",
      });
  }
};
