import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/db.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

export const getHuffazList = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const search = (req.query.search as string) || "";
    const isActive = req.query.isActive as string | undefined;

    const where: any = { role: "HUFFAZ" };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { mobileNumber: { contains: search, mode: "insensitive" } },
      ];
    }
    if (typeof isActive !== "undefined") {
      where.isActive = isActive === "true";
    }

    const totalRecords = await prisma.user.count({ where });
    const huffaz = await prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        username: true,
        email: true,
        mobileNumber: true,
        profileImage: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Huffaz list retrieved successfully.",
      data: huffaz,
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
    console.error("getHuffazList error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getHuffazById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : undefined;
    if (!id) {
      res.status(400).json({ success: false, message: "Invalid Huffaz id." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        username: true,
        email: true,
        mobileNumber: true,
        profileImage: true,
        isActive: true,
        createdAt: true,
        role: true,
      },
    });

    if (!user || user.role !== "HUFFAZ") {
      res.status(404).json({
        success: false,
        message: "Huffaz not found",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Huffaz retrieved successfully.",
      data: user,
    });
  } catch (error: any) {
    console.error("getHuffazById error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const createHuffaz = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      username,
      password,
      firstName,
      lastName,
      email,
      mobileNumber,
      profileImage,
    } = req.body;

    if (!username || !password || !firstName || !lastName || !mobileNumber) {
      res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: [
          {
            field: "required",
            message:
              "username, password, firstName, lastName, and mobileNumber are required",
          },
        ],
      });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }, { mobileNumber }].filter(Boolean) as any,
      },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message:
          "User with same username, email, or mobile number already exists",
        code: "DUPLICATE_RECORD",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        email,
        mobileNumber,
        profileImage,
        role: "HUFFAZ",
        isActive: true,
        createdBy: req.user?.userId ?? null,
        updatedBy: req.user?.userId ?? null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Huffaz created successfully.",
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        mobileNumber: user.mobileNumber,
        profileImage: user.profileImage,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    console.error("createHuffaz error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const updateHuffaz = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : undefined;
    if (!id) {
      res.status(400).json({ success: false, message: "Invalid Huffaz id." });
      return;
    }
    const { firstName, lastName, email, mobileNumber, profileImage, isActive } =
      req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== "HUFFAZ") {
      res.status(404).json({
        success: false,
        message: "Huffaz not found",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    if (email || mobileNumber) {
      const duplicate = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                email ? { email } : undefined,
                mobileNumber ? { mobileNumber } : undefined,
              ].filter(Boolean) as any,
            },
          ],
        },
      });

      if (duplicate) {
        res.status(409).json({
          success: false,
          message: "Email or mobile number already in use",
          code: "DUPLICATE_RECORD",
        });
        return;
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        firstName: firstName ?? existing.firstName,
        lastName: lastName ?? existing.lastName,
        fullName:
          `${firstName ?? existing.firstName} ${lastName ?? existing.lastName}`.trim(),
        email: email ?? existing.email,
        mobileNumber: mobileNumber ?? existing.mobileNumber,
        profileImage: profileImage ?? existing.profileImage,
        isActive: typeof isActive === "boolean" ? isActive : existing.isActive,
        updatedBy: req.user?.userId ?? null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Huffaz updated successfully.",
      data: {
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        fullName: updated.fullName,
        username: updated.username,
        email: updated.email,
        mobileNumber: updated.mobileNumber,
        profileImage: updated.profileImage,
        isActive: updated.isActive,
      },
    });
  } catch (error: any) {
    console.error("updateHuffaz error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const deleteHuffaz = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : undefined;
    if (!id) {
      res.status(400).json({ success: false, message: "Invalid Huffaz id." });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing || existing.role !== "HUFFAZ") {
      res.status(404).json({
        success: false,
        message: "Huffaz not found",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: req.user?.userId ?? null,
        updatedBy: req.user?.userId ?? null,
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Huffaz deleted successfully." });
  } catch (error: any) {
    console.error("deleteHuffaz error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};
