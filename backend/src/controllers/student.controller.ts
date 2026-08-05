import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

const prisma = new PrismaClient();

export const getStudents = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const search = (req.query.search as string) || "";
    const status = req.query.status as any; // e.g., 'ACTIVE'

    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { itsNumber: { contains: search, mode: "insensitive" } },
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
    res
      .status(500)
      .json({
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
    const rawStudentId = req.params.studentId;
    const studentId = Array.isArray(rawStudentId)
      ? rawStudentId[0]
      : rawStudentId;
    if (!studentId) {
      res
        .status(400)
        .json({ success: false, message: "Student ID is required." });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        currentMarhala: true,
      },
    });

    if (!student || !student.isActive) {
      res
        .status(404)
        .json({
          success: false,
          message: "Student not found",
          code: "RESOURCE_NOT_FOUND",
        });
      return;
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Student retrieved successfully.",
        data: student,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
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
      res
        .status(409)
        .json({
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
        fullName: data.fullName || `${data.firstName} ${data.lastName}`,
        fatherName: data.fatherName,
        mobileNumber: data.mobileNumber,
        parentMobileNumber: data.parentMobileNumber,
        address: data.address,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        admissionDate: data.admissionDate
          ? new Date(data.admissionDate)
          : new Date(),
        gender: data.gender || "MALE",
        currentMarhala: {
          connect: { id: data.currentMarhalaId },
        },
        status: data.currentStatus || "ACTIVE",
        createdBy: req.user?.userId || "SYSTEM",
        updatedBy: req.user?.userId || "SYSTEM",
      },
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Student created successfully.",
        data: newStudent,
      });
  } catch (error: any) {
    console.error("createStudent error:", error);
    res
      .status(500)
      .json({
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
    const rawStudentId = req.params.studentId;
    const studentId = Array.isArray(rawStudentId)
      ? rawStudentId[0]
      : rawStudentId;
    if (!studentId) {
      res
        .status(400)
        .json({ success: false, message: "Student ID is required." });
      return;
    }

    const data = req.body;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student || !student.isActive) {
      res
        .status(404)
        .json({
          success: false,
          message: "Student not found",
          code: "RESOURCE_NOT_FOUND",
        });
      return;
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        admissionDate: data.admissionDate
          ? new Date(data.admissionDate)
          : undefined,
        updatedBy: req.user!.userId,
      },
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Student updated successfully.",
        data: updated,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error.",
        code: "INTERNAL_SERVER_ERROR",
      });
  }
};

export const deleteStudent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const rawStudentId = req.params.studentId;
    const studentId = Array.isArray(rawStudentId)
      ? rawStudentId[0]
      : rawStudentId;
    if (!studentId) {
      res
        .status(400)
        .json({ success: false, message: "Student ID is required." });
      return;
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student || !student.isActive) {
      res
        .status(404)
        .json({
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
        deletedAt: new Date(),
        deletedBy: req.user!.userId,
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Student deleted successfully." });
  } catch (error: any) {
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error.",
        code: "INTERNAL_SERVER_ERROR",
      });
  }
};
