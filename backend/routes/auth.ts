import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import db from "../db/index.js";
import { validate } from "../middleware/validate.js";
import { requireAuth, generateToken } from "../middleware/auth.js";
import { formatUser } from "../utils.js";

const router = Router();

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  uiuEmail: z.string().email().optional(),
  uiuIdNumber: z.string().optional(),
  uiuIdImage: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/auth/register
router.post(
  "/register",
  validate(RegisterSchema),
  (req: Request, res: Response) => {
    try {
      const { name, email, password, uiuEmail, uiuIdNumber, uiuIdImage } =
        req.body;

      const existing = db
        .prepare("SELECT id FROM users WHERE lower(email) = lower(?)")
        .get(email);
      if (existing) {
        res.status(409).json({ detail: "Email already registered" });
        return;
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const userId = crypto.randomUUID();
      const joinedDate = new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      const hasVerificationData = !!(uiuEmail && uiuIdNumber && uiuIdImage);
      const verificationStatus = hasVerificationData ? "pending" : "unverified";
      const now = new Date().toISOString();

      db.prepare(
        `
      INSERT INTO users
        (id, name, email, password_hash, role, verification_status,
         uiu_email, uiu_id_number, uiu_id_image, verification_submitted_at, joined_date)
      VALUES (?, ?, ?, ?, 'user', ?, ?, ?, ?, ?, ?)
    `,
      ).run(
        userId,
        name,
        email,
        passwordHash,
        verificationStatus,
        uiuEmail ?? null,
        uiuIdNumber ?? null,
        uiuIdImage ?? null,
        hasVerificationData ? now : null,
        joinedDate,
      );

      if (hasVerificationData) {
        db.prepare(
          `
        INSERT INTO verification_requests
          (id, user_id, uiu_email, uiu_id_number, uiu_id_image, status, submitted_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?)
      `,
        ).run(
          crypto.randomUUID(),
          userId,
          uiuEmail,
          uiuIdNumber,
          uiuIdImage,
          now,
        );
      }

      const user = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(userId) as any;
      const token = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verification_status,
      });

      res.status(201).json({ user: formatUser(user), token });
    } catch (err: any) {
      res.status(500).json({ detail: err.message });
    }
  },
);

// POST /api/auth/login
router.post("/login", validate(LoginSchema), (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = db
      .prepare(
        "SELECT * FROM users WHERE lower(email) = lower(?) OR lower(uiu_email) = lower(?)",
      )
      .get(email, email) as any;

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      res.status(401).json({ detail: "Invalid email or password" });
      return;
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verificationStatus: user.verification_status,
    });

    res.json({ user: formatUser(user), token });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, (req: Request, res: Response) => {
  try {
    const user = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(req.user!.id) as any;
    if (!user) {
      res.status(404).json({ detail: "User not found" });
      return;
    }
    res.json(formatUser(user));
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

export default router;
