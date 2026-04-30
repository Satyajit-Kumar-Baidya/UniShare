import { Router, Request, Response } from "express";
import { z } from "zod";
import db from "../db/index.js";
import { requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { formatUser, formatVerificationRequest } from "../utils.js";

const router = Router();

const SubmitSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  uiuEmail: z.string().email(),
  uiuIdNumber: z.string().min(1),
  uiuIdImage: z.string().min(1),
});

// POST /api/verifications/submit/
router.post(
  "/submit/",
  validate(SubmitSchema),
  (req: Request, res: Response) => {
    try {
      const { name, email, uiuEmail, uiuIdNumber, uiuIdImage } = req.body;
      const normalizedEmail = email.trim().toLowerCase();
      const now = new Date().toISOString();

      let user = db
        .prepare("SELECT * FROM users WHERE lower(email) = ?")
        .get(normalizedEmail) as any;

      if (user) {
        db.prepare(
          `
        UPDATE users SET
          name = ?, uiu_email = ?, uiu_id_number = ?, uiu_id_image = ?,
          verification_status = 'pending', verification_submitted_at = ?,
          verification_reviewed_at = NULL, verification_note = NULL
        WHERE id = ?
      `,
        ).run(name, uiuEmail, uiuIdNumber, uiuIdImage, now, user.id);
      } else {
        const userId = crypto.randomUUID();
        const joinedDate = new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
        db.prepare(
          `
        INSERT INTO users
          (id, name, email, password_hash, role, verification_status,
           uiu_email, uiu_id_number, uiu_id_image, verification_submitted_at, joined_date)
        VALUES (?, ?, ?, '', 'user', 'pending', ?, ?, ?, ?, ?)
      `,
        ).run(
          userId,
          name,
          normalizedEmail,
          uiuEmail,
          uiuIdNumber,
          uiuIdImage,
          now,
          joinedDate,
        );
      }

      user = db
        .prepare("SELECT * FROM users WHERE lower(email) = ?")
        .get(normalizedEmail) as any;

      const vrId = crypto.randomUUID();
      db.prepare(
        `
      INSERT INTO verification_requests
        (id, user_id, uiu_email, uiu_id_number, uiu_id_image, status, submitted_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `,
      ).run(vrId, user.id, uiuEmail, uiuIdNumber, uiuIdImage, now);

      const request = db
        .prepare(
          "SELECT vr.*, u.name AS user_name, u.email AS user_email FROM verification_requests vr LEFT JOIN users u ON vr.user_id = u.id WHERE vr.id = ?",
        )
        .get(vrId) as any;

      res
        .status(201)
        .json({
          user: formatUser(user),
          request: formatVerificationRequest(request),
        });
    } catch (err: any) {
      res.status(500).json({ detail: err.message });
    }
  },
);

// GET /api/verifications/ — admin only
router.get("/", requireAdmin, (_req: Request, res: Response) => {
  try {
    const requests = db
      .prepare(
        `
      SELECT vr.*, u.name AS user_name, u.email AS user_email
      FROM verification_requests vr
      LEFT JOIN users u ON vr.user_id = u.id
      ORDER BY CASE WHEN vr.status = 'pending' THEN 0 ELSE 1 END, vr.submitted_at DESC
    `,
      )
      .all() as any[];
    res.json(requests.map(formatVerificationRequest));
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /api/verifications/:id/approve/
router.post("/:id/approve/", requireAdmin, (req: Request, res: Response) => {
  try {
    const request = db
      .prepare("SELECT * FROM verification_requests WHERE id = ?")
      .get(req.params.id) as any;
    if (!request) {
      res.status(404).json({ detail: "Request not found" });
      return;
    }

    const now = new Date().toISOString();
    const adminNote = req.body?.adminNote ?? null;

    db.prepare(
      `UPDATE verification_requests SET status = 'approved', reviewed_at = ?, admin_note = ? WHERE id = ?`,
    ).run(now, adminNote, req.params.id);
    db.prepare(
      `UPDATE users SET verification_status = 'verified', verification_reviewed_at = ?, verification_note = NULL WHERE id = ?`,
    ).run(now, request.user_id);

    const updatedReq = db
      .prepare(
        "SELECT vr.*, u.name AS user_name, u.email AS user_email FROM verification_requests vr LEFT JOIN users u ON vr.user_id = u.id WHERE vr.id = ?",
      )
      .get(req.params.id) as any;
    const user = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(request.user_id) as any;

    res.json({
      request: formatVerificationRequest(updatedReq),
      user: formatUser(user),
    });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /api/verifications/:id/reject/
router.post("/:id/reject/", requireAdmin, (req: Request, res: Response) => {
  try {
    const request = db
      .prepare("SELECT * FROM verification_requests WHERE id = ?")
      .get(req.params.id) as any;
    if (!request) {
      res.status(404).json({ detail: "Request not found" });
      return;
    }

    const now = new Date().toISOString();
    const note =
      req.body?.adminNote ?? "Please review and resubmit your verification.";

    db.prepare(
      `UPDATE verification_requests SET status = 'rejected', reviewed_at = ?, admin_note = ? WHERE id = ?`,
    ).run(now, note, req.params.id);
    db.prepare(
      `UPDATE users SET verification_status = 'rejected', verification_reviewed_at = ?, verification_note = ? WHERE id = ?`,
    ).run(now, note, request.user_id);

    const updatedReq = db
      .prepare(
        "SELECT vr.*, u.name AS user_name, u.email AS user_email FROM verification_requests vr LEFT JOIN users u ON vr.user_id = u.id WHERE vr.id = ?",
      )
      .get(req.params.id) as any;
    const user = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(request.user_id) as any;

    res.json({
      request: formatVerificationRequest(updatedReq),
      user: formatUser(user),
    });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

export default router;
