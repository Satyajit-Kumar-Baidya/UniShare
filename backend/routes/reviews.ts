import { Router, Request, Response } from "express";
import { z } from "zod";
import db from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const CreateReviewSchema = z.object({
  sellerId: z.string().min(1),
  itemId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// GET /api/reviews/?seller=:id
router.get("/", (req: Request, res: Response) => {
  try {
    const sellerId = req.query.seller as string;
    if (!sellerId) {
      res.status(400).json({ detail: "seller query param required" });
      return;
    }

    const reviews = db
      .prepare(
        `
      SELECT r.*, u.name AS reviewer_name, u.avatar AS reviewer_avatar, m.title AS item_title
      FROM reviews r
      LEFT JOIN users u ON r.reviewer_id = u.id
      LEFT JOIN marketplace_items m ON r.item_id = m.id
      WHERE r.seller_id = ?
      ORDER BY r.created_at DESC
    `,
      )
      .all(sellerId) as any[];

    res.json(
      reviews.map((r) => ({
        id: r.id,
        reviewerId: r.reviewer_id,
        reviewerName: r.reviewer_name,
        reviewerAvatar: r.reviewer_avatar ?? undefined,
        sellerId: r.seller_id,
        itemId: r.item_id ?? undefined,
        itemTitle: r.item_title ?? undefined,
        rating: r.rating,
        comment: r.comment ?? undefined,
        createdAt: r.created_at,
      })),
    );
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /api/reviews/
router.post(
  "/",
  requireAuth,
  validate(CreateReviewSchema),
  (req: Request, res: Response) => {
    try {
      const { sellerId, itemId, rating, comment } = req.body;
      if (req.user!.id === sellerId) {
        res.status(400).json({ detail: "Cannot review yourself" });
        return;
      }
      const id = crypto.randomUUID();
      db.prepare(
        `
      INSERT INTO reviews (id, reviewer_id, seller_id, item_id, rating, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      ).run(
        id,
        req.user!.id,
        sellerId,
        itemId ?? null,
        rating,
        comment ?? null,
      );
      res
        .status(201)
        .json({ id, reviewerId: req.user!.id, sellerId, rating, comment });
    } catch (err: any) {
      res.status(500).json({ detail: err.message });
    }
  },
);

export default router;
