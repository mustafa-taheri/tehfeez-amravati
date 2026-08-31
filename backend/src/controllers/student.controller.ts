import type { Request, Response } from "express";
import { prisma } from "../utils/db.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

export const getStudents = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const search = (req.query.search as string) || "";
    const status = req.query.status as string | undefined;

    const where: any = { isActive: true };
    if (search) {
      const searchAsNumber = parseInt(search, 10);
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        // Only search by itsNumber if the search term is a valid number
        ...(!isNaN(searchAsNumber)
          ? [{ itsNumber: { equals: searchAsNumber } }]
          : []),
      ];
    }
    if (status) {
      where.status = status;
    }

    const totalRecords = await prisma.student.count({ where });
    const students = await prisma.student.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        currentMarhala: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Students retrieved successfully.",
      data: students,
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
    console.error("getStudents error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getStudentById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const studentId =
      typeof req.params.studentId === "string"
        ? req.params.studentId
        : undefined;
    if (!studentId) {
      res.status(400).json({ success: false, message: "Invalid student id." });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        currentMarhala: true,
      },
    });

    if (!student || !student.isActive) {
      res.status(404).json({
        success: false,
        message: "Student not found",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Student retrieved successfully.",
      data: student,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const createStudent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const data = req.body;

    // Minimal validation
    if (
      !data.itsNumber ||
      !data.firstName ||
      !data.lastName ||
      !data.currentMarhalaId
    ) {
      res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: [
          {
            field: "required",
            message:
              "itsNumber, firstName, lastName, currentMarhalaId are required",
          },
        ],
      });
      return;
    }

    // Check if exists
    const existing = await prisma.student.findUnique({
      where: { itsNumber: data.itsNumber },
    });
    if (existing) {
      res.status(409).json({
        success: false,
        message: "Student with ITS Number already exists",
        code: "DUPLICATE_RECORD",
      });
      return;
    }

    const newStudent = await prisma.student.create({
      data: {
        itsNumber: data.itsNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        fatherName: data.fatherName,
        mobileNumber: data.mobileNumber,
        parentMobileNumber: data.parentMobileNumber,
        address: data.address,
        dateOfBirth: data.dateOfBirth
          ? dayjs.utc(data.dateOfBirth, "DD-MM-YYYY", true).toDate()
          : null,
        admissionDate: data.admissionDate
          ? dayjs.utc(data.admissionDate, "DD-MM-YYYY", true).toDate()
          : dayjs().toDate(),
        gender: data.gender || "MALE",
        currentMarhala: {
          connect: { id: data.currentMarhalaId },
        },
        status: data.status || "ACTIVE",
        createdBy: req.user?.userId || "SYSTEM",
        updatedBy: req.user?.userId || "SYSTEM",
      },
    });

    res.status(201).json({
      success: true,
      message: "Student created successfully.",
      data: newStudent,
    });
  } catch (error: any) {
    console.error("createStudent error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const updateStudent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const studentId =
      typeof req.params.studentId === "string"
        ? req.params.studentId
        : undefined;

    if (!studentId) {
      res.status(400).json({ success: false, message: "Invalid student id." });
      return;
    }

    const data = req.body;
    const userId = req.user?.userId;

    // 1. Fetch current student to check existence and current Marhala
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || !student.isActive) {
      res.status(404).json({
        success: false,
        message: "Student not found",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    // 2. Prepare payload formatting
    const formattedData = {
      ...data,
      dateOfBirth: data.dateOfBirth
        ? dayjs.utc(data.dateOfBirth, "DD-MM-YYYY", true).toDate()
        : undefined,
      admissionDate: data.admissionDate
        ? dayjs.utc(data.admissionDate, "DD-MM-YYYY", true).toDate()
        : undefined,
      updatedBy: userId,
    };

    // 3. Execute both operations atomically in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Create history record only if Marhala ID has changed
      if (
        data.currentMarhalaId &&
        student.currentMarhalaId !== data.currentMarhalaId
      ) {
        await tx.marhalaHistory.create({
          data: {
            studentId,
            fromMarhalaId: student.currentMarhalaId,
            toMarhalaId: data.currentMarhalaId,
            promotedBy: userId,
            reason: "System detected change of Marhala ID",
          },
        });
      }

      // Update student details
      return await tx.student.update({
        where: { id: studentId },
        data: formattedData,
      });
    });

    res.status(200).json({
      success: true,
      message: "Student updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    console.error("Update Student Error:", error);

    res.status(500).json({
      success: false,
      message:
        "Sorry.. Unable to update student details. Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const deleteStudent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const studentId =
      typeof req.params.studentId === "string"
        ? req.params.studentId
        : undefined;
    if (!studentId) {
      res.status(400).json({ success: false, message: "Invalid student id." });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student || !student.isActive) {
      res.status(404).json({
        success: false,
        message: "Student not found",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    await prisma.student.update({
      where: { id: studentId },
      data: {
        isActive: false,
        deletedAt: dayjs().toDate(),
        deletedBy: req.user?.userId ?? null,
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Student deleted successfully." });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};
