import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret_jwt_key_for_tehfeez";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "5d";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "10d";

export interface TokenPayload {
  userId: string;
  role: string;
}

export const generateTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 86400, // 1 day in seconds
  };
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
