import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  verificationStatus: string;
}

// Augment Express so req.user is typed everywhere
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const JWT_SECRET =
  process.env.JWT_SECRET ?? "unishare-dev-secret-change-in-prod";

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ detail: "Authentication required" });
    return;
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ detail: "Invalid or expired token" });
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      res.status(403).json({ detail: "Admin access required" });
      return;
    }
    next();
  });
}
