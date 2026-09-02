import type { Request, Response } from "express";
import { prisma } from "../utils/db.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

export const recordQuranSession = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      studentId,
      academicMonthId,
      sessionDate,
      sessionType,
      siparaNumber,
      surahName,
      // startAyah,
      // endAyah,
      murajaahJuz,
      murajaahMarks,
      juzHaaliMarks,
      jadeedStartAyah,
      // jadeedEndAyah,
      // tasmeeMarks,
      hifzProgress,
      durationMinutes,
      remarks,
    } = req.body;

    if (!studentId || !academicMonthId || !sessionDate || !sessionType) {
      res.status(400).json({
        success: false,
        message:
          "Validation failed: studentId, academicMonthId, sessionDate, sessionType are required.",
      });
      return;
    }

    const session = await prisma.quranSession.create({
      data: {
        studentId,
        academicMonthId,
        huffazId: req.user!.userId, // Recorded by the current huffaz
        sessionDate: dayjs(sessionDate, "DD-MM-YYYY", true).toDate(),
        sessionType,
        siparaNumber,
        surahName,
        // startAyah,
        // endAyah,
        murajaahJuz,
        murajaahMarks,
        juzHaaliMarks,
        jadeedStartAyah,
        // jadeedEndAyah,
        // tasmeeMarks,
        hifzProgress,
        durationMinutes,
        remarks,
        recordedBy: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Quran session recorded successfully.",
      data: session,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      success: false,
      message:
        "Sorry.. Unable to record session at the moment. Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getQuranSessions = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const { studentId, userId, sessionDate, academicMonthId } = req.query;

    const where: any = { isActive: true };
    if (studentId) where.studentId = studentId as string;
    if (userId) where.huffazId = userId as string;
    if (academicMonthId) where.academicMonthId = academicMonthId as string;
    if (sessionDate)
      where.sessionDate = dayjs(
        sessionDate as string,
        "DD-MM-YYYY",
        true,
      ).toDate();

    const totalRecords = await prisma.quranSession.count({ where });
    const sessions = await prisma.quranSession.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        huffaz: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Quran sessions retrieved successfully.",
      data: sessions,
      meta: {
        page,
        pageSize,
        totalRecords,
        totalPages: Math.ceil(totalRecords / pageSize),
        hasNextPage: page * pageSize < totalRecords,
        hasPreviousPage: page > 1,
      },
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
