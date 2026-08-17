import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../utils/db.js";
import { generateTokens, verifyToken } from "../utils/jwt.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import dayjs from "dayjs";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: [
          {
            field: "username/password",
            message: "Username and password are required",
          },
        ],
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid username or password.",
        code: "INVALID_CREDENTIALS",
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: "User account is inactive.",
        code: "ACCESS_DENIED",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid username or password.",
        code: "INVALID_CREDENTIALS",
      });
      return;
    }

    const tokens = generateTokens({ userId: user.id, role: user.role });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: dayjs().toDate() },
    });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          username: user.username,
          role: user.role,
          profileImage: user.profileImage,
        },
        tokens,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res
        .status(400)
        .json({ success: false, message: "Refresh token is required" });
      return;
    }

    const decoded = verifyToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        isActive: true,
        firstName: true,
        lastName: true,
        fullName: true,
        username: true,
        profileImage: true,
      },
    });
    if (!user || !user.isActive) {
      res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
      return;
    }

    const tokens = generateTokens({ userId: user.id, role: user.role });
    res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
      data: {
        tokens,
        user,
      },
    });
  } catch (error: any) {
    console.error("refreshToken error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
      code: "TOKEN_EXPIRED",
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    // // If user Role is Huffaz, send current active academic month attandance count along with user profile
    // let huffazAttendanceCount = 0;
    // if (authReq.user.role === "HUFFAZ") {
    //   const academicMonth = await prisma.academicMonth.findFirst({
    //     where: { isActive: true },
    //     orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
    //   });

    //   if (academicMonth) {
    //     huffazAttendanceCount = await prisma.huffazAttendance.count({
    //       where: { academicMonthId: academicMonth.id },
    //     });
    //   }
    // }

    const user = await prisma.user.findUnique({
      where: { id: authReq.user.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        username: true,
        email: true,
        mobileNumber: true,
        profileImage: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully.",
      data: {
        ...user,
        // huffazAttendanceCount,
      },
    });
  } catch (error: any) {
    console.error("getMe error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    const { firstName, lastName, profileImage, email, mobileNumber } = req.body;
    const userId = authReq.user.userId;

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      res.status(404).json({
        success: false,
        message: "User not found",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    if (email || mobileNumber) {
      const duplicate = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
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
      where: { id: userId },
      data: {
        firstName: firstName ?? existing.firstName,
        lastName: lastName ?? existing.lastName,
        fullName:
          `${firstName ?? existing.firstName} ${lastName ?? existing.lastName}`.trim(),
        profileImage: profileImage ?? existing.profileImage,
        email: email ?? existing.email,
        mobileNumber: mobileNumber ?? existing.mobileNumber,
        updatedBy: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        username: true,
        email: true,
        mobileNumber: true,
        profileImage: true,
        role: true,
        isActive: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    console.error("updateProfile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res
        .status(401)
        .json({ success: false, message: "Authentication required" });
      return;
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: authReq.user.userId },
    });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
        code: "RESOURCE_NOT_FOUND",
      });
      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Old password is incorrect",
        code: "INVALID_CREDENTIALS",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        updatedBy: user.id,
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully." });
  } catch (error: any) {
    console.error("changePassword error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};
