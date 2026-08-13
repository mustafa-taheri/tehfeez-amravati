import type { Request, Response } from "express";
import { prisma } from "../utils/db.js";

export const createAcademicPeriod = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, startDate, endDate } = req.body;

    if (!name || !startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: "Missing required fields.",
        code: "BAD_REQUEST",
      });
      return;
    }

    const newAcademicPeriod = await prisma.academicPeriod.create({
      data: {
        name: `${name}-Academic-Year`,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent: false, // Default value, you can adjust as needed
        isActive: true, // Default value, you can adjust as needed
      },
    });

    res.status(201).json({
      success: true,
      message: "Academic period created successfully.",
      data: newAcademicPeriod,
    });
  } catch (error: any) {
    console.error("createAcademicPeriod error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

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
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const createAcademicMonth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, startDate, endDate, academicPeriodId, monthNumber } =
      req.body;

    if (!name || !startDate || !endDate || !academicPeriodId || !monthNumber) {
      res.status(400).json({
        success: false,
        message: "Missing required fields.",
        code: "BAD_REQUEST",
      });
      return;
    }
    const currentYear = new Date().getFullYear();
    const newAcademicMonth = await prisma.academicMonth.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        academicPeriodId,
        monthNumber,
        year: currentYear,
        workingDays: 22, // Default value, you can adjust as needed
        isCurrent: false, // Default value, you can adjust as needed
        isActive: true, // Default value, you can adjust as needed
      },
    });

    res.status(201).json({
      success: true,
      message: "Academic month created successfully.",
      data: newAcademicMonth,
    });
  } catch (error: any) {
    console.error("createAcademicMonth error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};
