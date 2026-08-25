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

export const getAcademicPeriods = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const periods = await prisma.academicPeriod.findMany({
      orderBy: { startDate: "desc" },
    });
    res.status(200).json({
      success: true,
      data: periods,
    });
  } catch (error: any) {
    console.error("getAcademicPeriods error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
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

export const getAcademicMonthsOfActivePeriod = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const activePeriod = await prisma.academicPeriod.findFirst({
      where: { isActive: true },
    });

    if (!activePeriod) {
      res.status(404).json({
        success: false,
        message: "No active academic period found.",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    const academicMonths = await prisma.academicMonth.findMany({
      where: {
        academicPeriodId: activePeriod.id,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: [{ monthNumber: "asc" }],
    });

    res.status(200).json({
      success: true,
      message: "Academic months of the active period retrieved successfully.",
      data: academicMonths,
    });
  } catch (error: any) {
    console.error("getAcademicMonthsOfActivePeriod error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};


export const updateAcademicPeriod = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id;
    const { name, startDate, endDate, isCurrent } = req.body;

    const existing = await prisma.academicPeriod.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Academic period not found." });
      return;
    }

    if (isCurrent === true) {
      await prisma.$transaction([
        prisma.academicPeriod.updateMany({
          where: { id: { not: id } },
          data: { isCurrent: false },
        }),
        prisma.academicPeriod.update({
          where: { id },
          data: {
            name: name ?? existing.name,
            startDate: startDate ? new Date(startDate) : existing.startDate,
            endDate: endDate ? new Date(endDate) : existing.endDate,
            isCurrent: true,
          },
        }),
        prisma.academicMonth.updateMany({
          where: { academicPeriodId: id },
          data: { isActive: true },
        }),
        prisma.academicMonth.updateMany({
          where: { academicPeriodId: { not: id } },
          data: { isActive: false },
        }),
      ]);
    } else if (isCurrent === false) {
      await prisma.$transaction([
        prisma.academicPeriod.update({
          where: { id },
          data: {
            name: name ?? existing.name,
            startDate: startDate ? new Date(startDate) : existing.startDate,
            endDate: endDate ? new Date(endDate) : existing.endDate,
            isCurrent: false,
          },
        }),
        prisma.academicMonth.updateMany({
          where: { academicPeriodId: id },
          data: { isActive: false },
        }),
      ]);
    } else {
      await prisma.academicPeriod.update({
        where: { id },
        data: {
          name: name ?? existing.name,
          startDate: startDate ? new Date(startDate) : existing.startDate,
          endDate: endDate ? new Date(endDate) : existing.endDate,
        },
      });
    }

    res.status(200).json({ success: true, message: "Academic period updated successfully." });
  } catch (error: any) {
    console.error("updateAcademicPeriod error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};


export const updateAcademicMonth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id;
    const { name, startDate, endDate, isCurrent } = req.body;

    const existing = await prisma.academicMonth.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Academic month not found." });
      return;
    }

    if (isCurrent === true) {
      await prisma.$transaction([
        prisma.academicMonth.updateMany({
          where: { id: { not: id } },
          data: { isCurrent: false },
        }),
        prisma.academicMonth.update({
          where: { id },
          data: {
            name: name ?? existing.name,
            startDate: startDate ? new Date(startDate) : existing.startDate,
            endDate: endDate ? new Date(endDate) : existing.endDate,
            isCurrent: true,
          },
        }),
      ]);
    } else {
      await prisma.academicMonth.update({
        where: { id },
        data: {
          name: name ?? existing.name,
          startDate: startDate ? new Date(startDate) : existing.startDate,
          endDate: endDate ? new Date(endDate) : existing.endDate,
          isCurrent: isCurrent ?? existing.isCurrent,
        },
      });
    }

    res.status(200).json({ success: true, message: "Academic month updated successfully." });
  } catch (error: any) {
    console.error("updateAcademicMonth error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};


export const getAcademicMonths = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const months = await prisma.academicMonth.findMany({
      orderBy: [{ year: "desc" }, { monthNumber: "desc" }],
      include: { academicPeriod: { select: { name: true } } }
    });
    res.status(200).json({ success: true, data: months });
  } catch (error: any) {
    console.error("getAcademicMonths error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
