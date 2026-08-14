import type { Request, Response } from "express";
import { prisma } from "../utils/db.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
// ------------------------------------------------------------------
// Student Attendance
// ------------------------------------------------------------------
export const markStudentAttendance = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      studentId,
      academicMonthId,
      attendanceDate,
      attendanceStatus,
      remarks,
    } = req.body;

    if (
      !studentId ||
      !academicMonthId ||
      !attendanceDate ||
      !attendanceStatus
    ) {
      res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: [{ field: "required", message: "Missing required fields" }],
      });
      return;
    }

    const existing = await prisma.studentAttendance.findUnique({
      where: {
        studentId_attendanceDate: {
          studentId,
          attendanceDate: dayjs
            .utc(attendanceDate, "DD-MM-YYYY", true)
            .toDate(),
        },
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: "Attendance already marked for this date",
        code: "DUPLICATE_RECORD",
      });
      return;
    }

    const attendance = await prisma.studentAttendance.create({
      data: {
        studentId,
        academicMonthId,
        attendanceDate: dayjs.utc(attendanceDate, "DD-MM-YYYY", true).toDate(),
        attendanceStatus,
        remarks,
        markedBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Student attendance marked successfully",
      data: attendance,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getStudentAttendance = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { studentId, academicMonthId, attendanceDate } = req.query;

    const where: any = {};
    if (studentId) where.studentId = studentId as string;
    if (academicMonthId) where.academicMonthId = academicMonthId as string;
    if (attendanceDate)
      where.attendanceDate = dayjs
        .utc(attendanceDate as string, "DD-MM-YYYY", true)
        .toDate();

    const records = await prisma.studentAttendance.findMany({
      where,
      orderBy: { attendanceDate: "desc" },
      select: {
        id: true,
        studentId: true,
        academicMonthId: true,
        attendanceStatus: true,
        attendanceDate: true,
        remarks: true,
      },
    });

    // Map through records to convert the native Date objects into strings
    const formattedRecords = records.map((record) => ({
      ...record,
      attendanceDate: record.attendanceDate
        ? dayjs.utc(record.attendanceDate).format("DD-MM-YYYY")
        : null,
    }));

    res.status(200).json({ success: true, data: formattedRecords });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

// ------------------------------------------------------------------
// Huffaz Attendance
// ------------------------------------------------------------------
export const markHuffazAttendance = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      userId,
      academicMonthId,
      attendanceDate,
      attendanceStatus,
      payablePercentage,
      remarks,
    } = req.body;

    if (!userId || !academicMonthId || !attendanceDate || !attendanceStatus) {
      res.status(400).json({ success: false, message: "Validation failed." });
      return;
    }

    const existing = await prisma.huffazAttendance.findUnique({
      where: {
        userId_attendanceDate: {
          userId,
          attendanceDate: dayjs
            .utc(attendanceDate, "DD-MM-YYYY", true)
            .toDate(),
        },
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: "Attendance already marked for this date",
        code: "DUPLICATE_RECORD",
      });
      return;
    }

    const attendance = await prisma.huffazAttendance.create({
      data: {
        userId,
        academicMonthId,
        attendanceDate: dayjs.utc(attendanceDate, "DD-MM-YYYY", true).toDate(),
        attendanceStatus,
        payablePercentage:
          payablePercentage ||
          (attendanceStatus === "HALF_DAY"
            ? 50
            : attendanceStatus === "PRESENT"
              ? 100
              : 0),
        remarks,
        markedBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Huffaz attendance marked successfully",
      data: attendance,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getHuffazAttendance = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId, academicMonthId, attendanceDate } = req.query;

    const where: any = {};
    if (userId) where.userId = userId as string;
    if (academicMonthId) where.academicMonthId = academicMonthId as string;
    if (attendanceDate)
      where.attendanceDate = dayjs
        .utc(attendanceDate as string, "DD-MM-YYYY", true)
        .toDate();

    const records = await prisma.huffazAttendance.findMany({
      where,
      orderBy: { attendanceDate: "desc" },
      select: {
        id: true,
        userId: true,
        academicMonthId: true,
        payablePercentage: true,
        attendanceStatus: true,
        attendanceDate: true,
        remarks: true,
      },
    });

    // Map through records to convert the native Date objects into strings
    const formattedRecords = records.map((record) => ({
      ...record,
      attendanceDate: record.attendanceDate
        ? dayjs.utc(record.attendanceDate).format("DD-MM-YYYY")
        : null,
    }));

    res.status(200).json({ success: true, data: formattedRecords });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getHuffazAttendanceCount = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ success: false, message: "User ID is required." });
      return;
    }

    const where: any = {};
    if (userId) where.userId = userId as string;

    const count = await prisma.huffazAttendance.count({
      where,
    });

    res.status(200).json({ success: true, data: { count } });
  } catch (error: any) {
    console.error("getHuffazAttendanceCount error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};
