import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/db';
import { generateTokens } from '../utils/jwt';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: [{ field: 'username/password', message: 'Username and password are required' }]
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid username or password.', code: 'INVALID_CREDENTIALS' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'User account is inactive.', code: 'ACCESS_DENIED' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid username or password.', code: 'INVALID_CREDENTIALS' });
      return;
    }

    const tokens = generateTokens({ userId: user.id, role: user.role });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
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
        tokens
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  // Omitted full implementation for brevity, logic involves verifying refresh token and re-issuing tokens.
  res.status(501).json({ success: false, message: 'Not implemented yet' });
};
