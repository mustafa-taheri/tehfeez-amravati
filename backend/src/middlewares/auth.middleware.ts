import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import type { TokenPayload } from "../utils/jwt.js";
import { prisma } from "../utils/db.js";

export interface AuthRequest extends Request {
  user?: TokenPayload & { isActive?: boolean };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ success: false, message: "Authentication required" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res
      .status(401)
      .json({ success: false, message: "Authentication required" });
    return;
  }

  try {
    const decoded = verifyToken(token);

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res
        .status(401)
        .json({ success: false, message: "Invalid token: User not found" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: "Access denied: User account is inactive",
      });
      return;
    }

    req.user = { ...decoded, isActive: user.isActive };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      code: "TOKEN_EXPIRED",
    });
    return;
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // console.log("User role:", req.user?.role);
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Access denied: Insufficient permissions",
        code: "ACCESS_DENIED",
      });
      return;
    }
    next();
  };
};
