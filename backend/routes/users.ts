import { Router, Request, Response } from "express";
import { z } from "zod";
import db from "../db/index.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { formatUser } from "../utils.js";

const router = Router();

const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  university: z.string().optional(),
  major: z.string().optional(),
  graduationYear: z.string().optional(),
  avatar: z.string().optional(),
});

// GET /api/users/by-email/?email=  (used by login flow)
router.get("/by-email/", (req: Request, res: Response) => {
  try {
    const email = (req.query.email as string)?.trim().toLowerCase();
    if (!email) {
      res.status(400).json({ detail: "email query param required" });
      return;
    }
    const user = db
      .prepare(
        "SELECT * FROM users WHERE lower(email) = ? OR lower(uiu_email) = ?",
      )
      .get(email, email) as any;
    if (!user) {
      res.status(404).json({ detail: "User not found" });
      return;
    }
    res.json(formatUser(user));
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /api/users/ — admin only
router.get("/", requireAdmin, (_req: Request, res: Response) => {
  try {
    const users = db
      .prepare("SELECT * FROM users ORDER BY created_at DESC")
      .all() as any[];
    res.json(users.map(formatUser));
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /api/users/:id
router.get("/:id", (req: Request, res: Response) => {
  try {
    const user = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(req.params.id) as any;
    if (!user) {
      res.status(404).json({ detail: "User not found" });
      return;
    }
    res.json(formatUser(user));
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// PUT /api/users/:id — owner or admin
router.put(
  "/:id",
  requireAuth,
  validate(UpdateProfileSchema),
  (req: Request, res: Response) => {
    try {
      if (req.user!.id !== req.params.id && req.user!.role !== "admin") {
        res.status(403).json({ detail: "Forbidden" });
        return;
      }
      const {
        name,
        phone,
        address,
        bio,
        university,
        major,
        graduationYear,
        avatar,
      } = req.body;
      db.prepare(
        `
      UPDATE users SET
        name            = COALESCE(?, name),
        phone           = COALESCE(?, phone),
        address         = COALESCE(?, address),
        bio             = COALESCE(?, bio),
        university      = COALESCE(?, university),
        major           = COALESCE(?, major),
        graduation_year = COALESCE(?, graduation_year),
        avatar          = COALESCE(?, avatar)
      WHERE id = ?
    `,
      ).run(
        name ?? null,
        phone ?? null,
        address ?? null,
        bio ?? null,
        university ?? null,
        major ?? null,
        graduationYear ?? null,
        avatar ?? null,
        req.params.id,
      );
      const updated = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(req.params.id) as any;
      res.json(formatUser(updated));
    } catch (err: any) {
      res.status(500).json({ detail: err.message });
    }
  },
);

export default router;
