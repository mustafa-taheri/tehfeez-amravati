import type { Request, Response } from "express";
import type { PaymentStatus } from "@prisma/client";
import { prisma } from "../utils/db.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

const calculatePaymentStatus = (
  configuredFee: number,
  discountAmount: number,
  waivedAmount: number,
  totalReceivedAmount: number,
) => {
  const due = configuredFee - discountAmount - waivedAmount;
  const outstanding = Math.max(due - totalReceivedAmount, 0);

  if (outstanding <= 0) {
    return "PAID";
  }

  if (totalReceivedAmount > 0) {
    return "PARTIAL_PAID";
  }

  if (waivedAmount >= configuredFee) {
    return "WAIVED";
  }

  if (discountAmount > 0) {
    return "DISCOUNTED";
  }

  return "UNPAID";
};

const roundToTwo = (value: number) => Math.round(value * 100) / 100;

// ------------------------------------------------------------------
// Student Fee Collection
// ------------------------------------------------------------------
export const createFeeCollection = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const studentId = req.body.studentId as string | undefined;
    const academicMonthId = req.body.academicMonthId as string | undefined;
    const marhalaFeeConfigurationId = req.body.marhalaFeeConfigurationId as
      | string
      | undefined;
    const configuredFee = Number(req.body.configuredFee);
    const discountAmount =
      req.body.discountAmount !== undefined
        ? Number(req.body.discountAmount)
        : 0;
    const waivedAmount =
      req.body.waivedAmount !== undefined ? Number(req.body.waivedAmount) : 0;
    const remarks = req.body.remarks as string | undefined;

    if (
      !studentId ||
      !academicMonthId ||
      !marhalaFeeConfigurationId ||
      req.body.configuredFee === undefined
    ) {
      res.status(400).json({
        success: false,
        message:
          "studentId, academicMonthId, marhalaFeeConfigurationId, and configuredFee are required.",
      });
      return;
    }

    const existing = await prisma.studentFeeCollection.findUnique({
      where: { studentId_academicMonthId: { studentId, academicMonthId } },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: "Fee collection already exists for this student and month.",
        code: "DUPLICATE_RECORD",
      });
      return;
    }

    const totalReceivedAmount = 0;
    const outstandingAmount = Math.max(
      configuredFee - discountAmount - waivedAmount,
      0,
    );
    const paymentStatus = calculatePaymentStatus(
      configuredFee,
      discountAmount,
      waivedAmount,
      totalReceivedAmount,
    );

    const collection = await prisma.studentFeeCollection.create({
      data: {
        studentId,
        academicMonthId,
        marhalaFeeConfigurationId,
        configuredFee,
        discountAmount,
        waivedAmount,
        totalReceivedAmount,
        outstandingAmount,
        paymentStatus,
        remarks: remarks ?? null,
        createdBy: req.user!.userId,
        updatedBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Fee collection record created successfully.",
      data: collection,
    });
  } catch (error: any) {
    console.error("createFeeCollection error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const updateFeeCollection = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : undefined;
    const configuredFee =
      req.body.configuredFee !== undefined
        ? Number(req.body.configuredFee)
        : undefined;
    const discountAmount =
      req.body.discountAmount !== undefined
        ? Number(req.body.discountAmount)
        : undefined;
    const waivedAmount =
      req.body.waivedAmount !== undefined
        ? Number(req.body.waivedAmount)
        : undefined;
    const remarks = req.body.remarks as string | undefined;
    const paymentStatus = req.body.paymentStatus as PaymentStatus | undefined;

    if (!id) {
      res
        .status(400)
        .json({ success: false, message: "Invalid fee collection id." });
      return;
    }

    const collection = await prisma.studentFeeCollection.findUnique({
      where: { id },
    });
    if (!collection) {
      res.status(404).json({
        success: false,
        message: "Fee collection record not found.",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    const newConfiguredFee =
      configuredFee !== undefined
        ? configuredFee
        : Number(collection.configuredFee);
    const newDiscountAmount =
      discountAmount !== undefined
        ? discountAmount
        : Number(collection.discountAmount);
    const newWaivedAmount =
      waivedAmount !== undefined
        ? waivedAmount
        : Number(collection.waivedAmount);
    const totalReceivedAmount = Number(collection.totalReceivedAmount);
    const outstandingAmount = Math.max(
      newConfiguredFee -
        newDiscountAmount -
        newWaivedAmount -
        totalReceivedAmount,
      0,
    );
    const status =
      paymentStatus ||
      calculatePaymentStatus(
        newConfiguredFee,
        newDiscountAmount,
        newWaivedAmount,
        totalReceivedAmount,
      );

    const updated = await prisma.studentFeeCollection.update({
      where: { id },
      data: {
        configuredFee: newConfiguredFee,
        discountAmount: newDiscountAmount,
        waivedAmount: newWaivedAmount,
        outstandingAmount,
        paymentStatus: status,
        remarks: remarks ?? collection.remarks,
        updatedBy: req.user!.userId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Fee collection record updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    console.error("updateFeeCollection error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const recordFeePayment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const studentId = req.body.studentId as string | undefined;
    const academicMonthId = req.body.academicMonthId as string | undefined;
    const amount = Number(req.body.amount);
    const paymentMode = req.body.paymentMode as string | undefined;
    const referenceNumber = req.body.referenceNumber as string | undefined;
    const remarks = req.body.remarks as string | undefined;

    if (!studentId || !academicMonthId || req.body.amount === undefined) {
      res.status(400).json({
        success: false,
        message: "studentId, academicMonthId, and amount are required.",
      });
      return;
    }

    const collection = await prisma.studentFeeCollection.findUnique({
      where: { studentId_academicMonthId: { studentId, academicMonthId } },
    });

    if (!collection) {
      res.status(404).json({
        success: false,
        message: "Fee collection record not found for this month.",
      });
      return;
    }

    const transaction = await prisma.feePaymentTransaction.create({
      data: {
        studentFeeCollectionId: collection.id,
        amount,
        paymentMode: paymentMode || "CASH",
        referenceNumber: referenceNumber ?? null,
        remarks: remarks ?? null,
        receivedBy: req.user!.userId,
      },
    });

    const totalReceivedAmount =
      Number(collection.totalReceivedAmount) + Number(amount);
    const outstandingAmount = Math.max(
      Number(collection.configuredFee) -
        Number(collection.discountAmount) -
        Number(collection.waivedAmount) -
        totalReceivedAmount,
      0,
    );
    const paymentStatus = calculatePaymentStatus(
      Number(collection.configuredFee),
      Number(collection.discountAmount),
      Number(collection.waivedAmount),
      totalReceivedAmount,
    );

    const updatedCollection = await prisma.studentFeeCollection.update({
      where: { id: collection.id },
      data: {
        totalReceivedAmount,
        outstandingAmount,
        paymentStatus,
        collectedBy: req.user!.userId,
        updatedBy: req.user!.userId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Fee payment recorded successfully.",
      data: { transaction, collection: updatedCollection },
    });
  } catch (error: any) {
    console.error("recordFeePayment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getFeeCollections = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { academicMonthId, studentId, paymentStatus } = req.query;

    const where: any = { isActive: true };
    if (academicMonthId) where.academicMonthId = academicMonthId as string;
    if (studentId) where.studentId = studentId as string;
    if (paymentStatus) where.paymentStatus = paymentStatus as any;

    const collections = await prisma.studentFeeCollection.findMany({
      where,
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            itsNumber: true,
            currentMarhalaId: true,
          },
        },
        marhalaFeeConfiguration: { include: { marhala: true } },
      },
    });

    res.status(200).json({ success: true, data: collections });
  } catch (error: any) {
    console.error("getFeeCollections error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

// ------------------------------------------------------------------
// Monthly Settlement
// ------------------------------------------------------------------
export const getMonthlySettlements = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { academicMonthId } = req.query;
    const where: any = {};
    if (academicMonthId) where.academicMonthId = academicMonthId as string;

    const settlements = await prisma.monthlySettlement.findMany({
      where,
      include: {
        academicMonth: {
          select: {
            id: true,
            name: true,
            monthNumber: true,
            year: true,
            settlementStatus: true,
          },
        },
      },
      orderBy: { generatedAt: "desc" },
    });

    res.status(200).json({ success: true, data: settlements });
  } catch (error: any) {
    console.error("getMonthlySettlements error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getMonthlySettlementById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : undefined;
    if (!id) {
      res
        .status(400)
        .json({ success: false, message: "Invalid settlement id." });
      return;
    }

    const settlement = await prisma.monthlySettlement.findUnique({
      where: { id },
      include: {
        academicMonth: {
          select: {
            id: true,
            name: true,
            monthNumber: true,
            year: true,
            workingDays: true,
            settlementStatus: true,
          },
        },
        monthlySettlementDetails: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                fullName: true,
              },
            },
            adjustments: true,
          },
        },
      },
    });

    if (!settlement) {
      res.status(404).json({
        success: false,
        message: "Settlement not found.",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    res.status(200).json({ success: true, data: settlement });
  } catch (error: any) {
    console.error("getMonthlySettlementById error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

const buildHuffazPayables = (
  activeHuffaz: Array<{ id: string; fullName: string }>,
  attendanceRecords: Array<{
    userId: string;
    attendanceDate: Date;
    attendanceStatus: string;
  }>,
  dailyPool: number,
  workingDays: number,
) => {
  const huffazStats = new Map(
    activeHuffaz.map((h) => [
      h.id,
      { attendanceDays: 0, calculatedAmount: 0, fullName: h.fullName },
    ]),
  );

  const attendanceByDay = new Map<
    string,
    { totalPoints: number; pointsByHuffaz: Map<string, number> }
  >();
  attendanceRecords.forEach((record) => {
    const [dateKey] = record.attendanceDate.toISOString().split("T");
    if (!dateKey) return;

    const points =
      record.attendanceStatus === "PRESENT"
        ? 1
        : record.attendanceStatus === "HALF_DAY"
          ? 0.5
          : 0;

    if (!attendanceByDay.has(dateKey)) {
      attendanceByDay.set(dateKey, {
        totalPoints: 0,
        pointsByHuffaz: new Map(),
      });
    }

    const entry = attendanceByDay.get(dateKey)!;
    entry.totalPoints += points;
    entry.pointsByHuffaz.set(
      record.userId,
      (entry.pointsByHuffaz.get(record.userId) || 0) + points,
    );
  });

  attendanceByDay.forEach(({ totalPoints, pointsByHuffaz }) => {
    const perPointValue = totalPoints > 0 ? dailyPool / totalPoints : 0;
    pointsByHuffaz.forEach((points, userId) => {
      const current = huffazStats.get(userId);
      if (!current) return;
      current.attendanceDays += points;
      current.calculatedAmount += roundToTwo(perPointValue * points);
    });
  });

  return Array.from(huffazStats.entries()).map(([userId, stats]) => ({
    userId,
    fullName: stats.fullName,
    attendanceDays: roundToTwo(stats.attendanceDays),
    attendancePercentage:
      workingDays > 0
        ? roundToTwo((stats.attendanceDays / workingDays) * 100)
        : 0,
    calculatedAmount: roundToTwo(stats.calculatedAmount),
  }));
};

export const getFinanceReport = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const academicMonthId =
      typeof req.query.academicMonthId === "string"
        ? req.query.academicMonthId
        : undefined;
    if (!academicMonthId) {
      res
        .status(400)
        .json({ success: false, message: "academicMonthId is required." });
      return;
    }

    const academicMonth = await prisma.academicMonth.findUnique({
      where: { id: academicMonthId },
    });
    if (!academicMonth) {
      res.status(404).json({
        success: false,
        message: "Academic month not found.",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    const feeCollections = await prisma.studentFeeCollection.findMany({
      where: { academicMonthId, isActive: true },
      include: { marhalaFeeConfiguration: { include: { marhala: true } } },
    });

    const totalStudents = feeCollections.length;
    const totalConfiguredFees = roundToTwo(
      feeCollections.reduce(
        (sum, collection) => sum + Number(collection.configuredFee),
        0,
      ),
    );
    const totalDiscountAmount = roundToTwo(
      feeCollections.reduce(
        (sum, collection) => sum + Number(collection.discountAmount),
        0,
      ),
    );
    const totalWaivedAmount = roundToTwo(
      feeCollections.reduce(
        (sum, collection) => sum + Number(collection.waivedAmount),
        0,
      ),
    );
    const totalCollectedAmount = roundToTwo(
      feeCollections.reduce(
        (sum, collection) => sum + Number(collection.totalReceivedAmount),
        0,
      ),
    );

    const feeByMarhala = Object.values(
      feeCollections.reduce(
        (acc, collection) => {
          const marhalaName = collection.marhalaFeeConfiguration.marhala.name;
          if (!acc[marhalaName]) {
            acc[marhalaName] = {
              marhalaName,
              studentCount: 0,
              totalConfiguredFee: 0,
              totalCollectedAmount: 0,
            };
          }
          acc[marhalaName].studentCount += 1;
          acc[marhalaName].totalConfiguredFee = roundToTwo(
            acc[marhalaName].totalConfiguredFee +
              Number(collection.configuredFee),
          );
          acc[marhalaName].totalCollectedAmount = roundToTwo(
            acc[marhalaName].totalCollectedAmount +
              Number(collection.totalReceivedAmount),
          );
          return acc;
        },
        {} as Record<
          string,
          {
            marhalaName: string;
            studentCount: number;
            totalConfiguredFee: number;
            totalCollectedAmount: number;
          }
        >,
      ),
    );

    const attendanceRecords = await prisma.huffazAttendance.findMany({
      where: { academicMonthId },
      orderBy: { attendanceDate: "asc" },
    });

    const attendanceSummary = attendanceRecords.reduce(
      (summary, record) => {
        summary.totalRecords += 1;
        const [dateKey] = record.attendanceDate.toISOString().split("T");
        if (dateKey) {
          summary.days.add(dateKey);
        }
        summary.statusCounts[record.attendanceStatus] =
          (summary.statusCounts[record.attendanceStatus] || 0) + 1;
        return summary;
      },
      {
        totalRecords: 0,
        days: new Set<string>(),
        statusCounts: {} as Record<string, number>,
      },
    );

    const activeHuffaz = await prisma.user.findMany({
      where: { role: "HUFFAZ", isActive: true },
      select: { id: true, fullName: true },
    });

    const dailyPool =
      academicMonth.workingDays > 0
        ? roundToTwo(totalCollectedAmount / academicMonth.workingDays)
        : 0;
    const huffazPayables = buildHuffazPayables(
      activeHuffaz,
      attendanceRecords,
      dailyPool,
      academicMonth.workingDays,
    );

    const settlement = await prisma.monthlySettlement.findUnique({
      where: { academicMonthId },
      include: { monthlySettlementDetails: true },
    });

    res.status(200).json({
      success: true,
      data: {
        academicMonth,
        totalStudents,
        totalConfiguredFees,
        totalDiscountAmount,
        totalWaivedAmount,
        totalCollectedAmount,
        dailyPool,
        feeByMarhala,
        attendanceSummary: {
          totalRecords: attendanceSummary.totalRecords,
          totalDays: attendanceSummary.days.size,
          statusCounts: attendanceSummary.statusCounts,
        },
        huffazPayables,
        settlement,
      },
    });
  } catch (error: any) {
    console.error("getFinanceReport error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getHuffazPayables = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const academicMonthId =
      typeof req.query.academicMonthId === "string"
        ? req.query.academicMonthId
        : undefined;
    if (!academicMonthId) {
      res
        .status(400)
        .json({ success: false, message: "academicMonthId is required." });
      return;
    }

    const academicMonth = await prisma.academicMonth.findUnique({
      where: { id: academicMonthId },
    });
    if (!academicMonth) {
      res.status(404).json({
        success: false,
        message: "Academic month not found.",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    const feeCollections = await prisma.studentFeeCollection.findMany({
      where: { academicMonthId, isActive: true },
    });

    const totalCollectedAmount = roundToTwo(
      feeCollections.reduce(
        (sum, collection) => sum + Number(collection.totalReceivedAmount),
        0,
      ),
    );

    const workingDays = academicMonth.workingDays || 30;
    const dailyPool =
      workingDays > 0 ? roundToTwo(totalCollectedAmount / workingDays) : 0;

    const attendanceRecords = await prisma.huffazAttendance.findMany({
      where: { academicMonthId },
      orderBy: { attendanceDate: "asc" },
    });

    const activeHuffaz = await prisma.user.findMany({
      where: { role: "HUFFAZ", isActive: true },
      select: { id: true, fullName: true },
    });

    const huffazPayables = buildHuffazPayables(
      activeHuffaz,
      attendanceRecords,
      dailyPool,
      workingDays,
    );

    res
      .status(200)
      .json({ success: true, data: { dailyPool, huffazPayables } });
  } catch (error: any) {
    console.error("getHuffazPayables error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const generateMonthlySettlement = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { academicMonthId } = req.body;

    if (!academicMonthId) {
      res
        .status(400)
        .json({ success: false, message: "academicMonthId is required." });
      return;
    }

    const academicMonth = await prisma.academicMonth.findUnique({
      where: { id: academicMonthId },
    });
    if (!academicMonth) {
      res.status(404).json({
        success: false,
        message: "Academic month not found.",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    if (academicMonth.settlementStatus === "LOCKED") {
      res.status(400).json({
        success: false,
        message: "Academic month is already locked.",
        code: "SETTLEMENT_LOCKED",
      });
      return;
    }

    const feeCollections = await prisma.studentFeeCollection.findMany({
      where: { academicMonthId, isActive: true },
      include: {
        student: { select: { id: true } },
      },
    });

    const totalStudents = feeCollections.length;
    const totalConfiguredFees = roundToTwo(
      feeCollections.reduce(
        (sum: number, collection) => sum + Number(collection.configuredFee),
        0,
      ),
    );
    const totalDiscountAmount = roundToTwo(
      feeCollections.reduce(
        (sum: number, collection) => sum + Number(collection.discountAmount),
        0,
      ),
    );
    const totalWaivedAmount = roundToTwo(
      feeCollections.reduce(
        (sum: number, collection) => sum + Number(collection.waivedAmount),
        0,
      ),
    );
    const totalCollectedAmount = roundToTwo(
      feeCollections.reduce(
        (sum: number, collection) =>
          sum + Number(collection.totalReceivedAmount),
        0,
      ),
    );
    const workingDays = academicMonth.workingDays || 30;
    const dailyPool =
      workingDays > 0 ? roundToTwo(totalCollectedAmount / workingDays) : 0;

    const attendanceRecords = await prisma.huffazAttendance.findMany({
      where: { academicMonthId },
      orderBy: { attendanceDate: "asc" },
    });

    const activeHuffaz = await prisma.user.findMany({
      where: { role: "HUFFAZ", isActive: true },
      select: { id: true },
    });

    const huffazMap = new Map(
      activeHuffaz.map((h) => [
        h.id,
        { attendanceDays: 0, calculatedAmount: 0 },
      ]),
    );

    const attendanceByDay = new Map<
      string,
      { totalPoints: number; pointsByHuffaz: Map<string, number> }
    >();
    attendanceRecords.forEach((record) => {
      const dateKey = record.attendanceDate.toISOString().split("T")[0];
      if (!dateKey) {
        return;
      }
      const points =
        record.attendanceStatus === "PRESENT"
          ? 1
          : record.attendanceStatus === "HALF_DAY"
            ? 0.5
            : 0;
      if (!attendanceByDay.has(dateKey)) {
        attendanceByDay.set(dateKey, {
          totalPoints: 0,
          pointsByHuffaz: new Map(),
        });
      }
      const entry = attendanceByDay.get(dateKey)!;
      entry.totalPoints += points;
      entry.pointsByHuffaz.set(
        record.userId,
        (entry.pointsByHuffaz.get(record.userId) || 0) + points,
      );
    });

    attendanceByDay.forEach(({ totalPoints, pointsByHuffaz }) => {
      const perPointValue = totalPoints > 0 ? dailyPool / totalPoints : 0;
      pointsByHuffaz.forEach((points, userId) => {
        const current = huffazMap.get(userId);
        if (!current) return;
        current.attendanceDays += points;
        current.calculatedAmount += roundToTwo(perPointValue * points);
      });
    });

    const settlementData = {
      academicMonthId,
      totalStudents,
      totalConfiguredFees,
      totalDiscountAmount,
      totalWaivedAmount,
      totalCollectedAmount,
      totalPayablePool: totalCollectedAmount,
      settlementStatus: "GENERATED" as const,
      generatedBy: req.user!.userId,
      createdBy: req.user!.userId,
      updatedBy: req.user!.userId,
    };

    let settlement = await prisma.monthlySettlement.findUnique({
      where: { academicMonthId },
    });
    if (settlement && settlement.settlementStatus === "LOCKED") {
      res.status(400).json({
        success: false,
        message: "Settlement is already locked for this month.",
        code: "SETTLEMENT_LOCKED",
      });
      return;
    }

    const existingDetails = settlement
      ? await prisma.monthlySettlementDetail.findMany({
          where: { monthlySettlementId: settlement.id },
        })
      : [];
    const detailsByHuffaz = new Map(
      existingDetails.map((detail) => [detail.userId, detail]),
    );

    if (settlement) {
      settlement = await prisma.monthlySettlement.update({
        where: { id: settlement.id },
        data: {
          ...settlementData,
          updatedBy: req.user!.userId,
        },
      });
      await prisma.monthlySettlementDetail.deleteMany({
        where: { monthlySettlementId: settlement.id },
      });
    } else {
      settlement = await prisma.monthlySettlement.create({
        data: settlementData,
      });
    }

    const settlementDetails = Array.from(huffazMap.entries()).map(
      ([userId, { attendanceDays, calculatedAmount }]) => {
        const existing = detailsByHuffaz.get(userId);
        const bonusAmount = existing ? Number(existing.bonusAmount) : 0;
        const deductionAmount = existing ? Number(existing.deductionAmount) : 0;
        const finalPayableAmount = roundToTwo(
          calculatedAmount + bonusAmount - deductionAmount,
        );
        return {
          monthlySettlementId: settlement.id,
          userId,
          attendanceDays: roundToTwo(attendanceDays),
          attendancePercentage:
            workingDays > 0
              ? roundToTwo((attendanceDays / workingDays) * 100)
              : 0,
          calculatedAmount: roundToTwo(calculatedAmount),
          bonusAmount,
          deductionAmount,
          finalPayableAmount,
        };
      },
    );

    await prisma.monthlySettlementDetail.createMany({
      data: settlementDetails,
      skipDuplicates: true,
    });

    await prisma.academicMonth.update({
      where: { id: academicMonthId },
      data: { settlementStatus: "GENERATED" },
    });

    const settlementWithDetails = await prisma.monthlySettlement.findUnique({
      where: { id: settlement.id },
      include: { monthlySettlementDetails: true },
    });

    res.status(200).json({
      success: true,
      message: "Monthly settlement generated.",
      data: settlementWithDetails,
    });
  } catch (error: any) {
    console.error("generateMonthlySettlement error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const addSettlementAdjustment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const settlementId =
      typeof req.params.settlementId === "string"
        ? req.params.settlementId
        : undefined;
    const detailId =
      typeof req.params.detailId === "string" ? req.params.detailId : undefined;
    const { adjustmentType, amount, reason } = req.body;

    if (!settlementId || !detailId) {
      res
        .status(400)
        .json({ success: false, message: "Invalid settlement or detail id." });
      return;
    }

    if (!adjustmentType || amount === undefined || !reason) {
      res.status(400).json({
        success: false,
        message: "adjustmentType, amount, and reason are required.",
      });
      return;
    }

    const settlement = await prisma.monthlySettlement.findUnique({
      where: { id: settlementId },
    });
    if (!settlement) {
      res.status(404).json({
        success: false,
        message: "Settlement not found.",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    const detail = await prisma.monthlySettlementDetail.findUnique({
      where: { id: detailId },
    });
    if (!detail || detail.monthlySettlementId !== settlementId) {
      res.status(404).json({
        success: false,
        message: "Settlement detail not found.",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    const adjustment = await prisma.settlementAdjustment.create({
      data: {
        monthlySettlementDetailId: detail.id,
        adjustmentType,
        amount,
        reason,
        adjustedBy: req.user!.userId,
      },
    });

    const bonusAmount =
      adjustmentType === "BONUS"
        ? Number(detail.bonusAmount) + Number(amount)
        : Number(detail.bonusAmount);
    const deductionAmount =
      adjustmentType === "DEDUCTION"
        ? Number(detail.deductionAmount) + Number(amount)
        : Number(detail.deductionAmount);
    const finalPayableAmount = roundToTwo(
      Number(detail.calculatedAmount) + bonusAmount - deductionAmount,
    );

    const updatedDetail = await prisma.monthlySettlementDetail.update({
      where: { id: detail.id },
      data: {
        bonusAmount,
        deductionAmount,
        finalPayableAmount,
      },
      include: { adjustments: true },
    });

    res.status(200).json({
      success: true,
      message: "Settlement adjustment applied successfully.",
      data: { adjustment, detail: updatedDetail },
    });
  } catch (error: any) {
    console.error("addSettlementAdjustment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const lockMonthlySettlement = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : undefined;
    if (!id) {
      res
        .status(400)
        .json({ success: false, message: "Invalid settlement id." });
      return;
    }

    const settlement = await prisma.monthlySettlement.findUnique({
      where: { id },
    });
    if (!settlement) {
      res
        .status(404)
        .json({ success: false, message: "Settlement not found." });
      return;
    }

    if (settlement.settlementStatus === "LOCKED") {
      res.status(400).json({
        success: false,
        message: "Settlement is already locked.",
        code: "SETTLEMENT_LOCKED",
      });
      return;
    }

    const locked = await prisma.monthlySettlement.update({
      where: { id },
      data: {
        settlementStatus: "LOCKED",
        lockedAt: new Date(),
        lockedBy: req.user!.userId,
        updatedBy: req.user!.userId,
      },
    });

    await prisma.academicMonth.update({
      where: { id: locked.academicMonthId },
      data: { settlementStatus: "LOCKED" },
    });

    res.status(200).json({
      success: true,
      message: "Monthly settlement locked successfully.",
      data: locked,
    });
  } catch (error: any) {
    console.error("lockMonthlySettlement error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};
