import { Router, Request, Response } from "express";
import { z } from "zod";
import db from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { formatItem } from "../utils.js";

const router = Router();

const ITEM_SELECT = `
  SELECT m.*, u.name AS seller_name,
    COALESCE(ROUND(AVG(r.rating), 1), 0) AS seller_rating,
    COUNT(DISTINCT r.id) AS reviews_count
  FROM marketplace_items m
  LEFT JOIN users u ON m.seller_id = u.id
  LEFT JOIN reviews r ON r.seller_id = m.seller_id
`;

const AddFavoriteSchema = z.object({
  itemId: z.string().min(1),
});

// GET /api/favorites/
router.get("/", requireAuth, (req: Request, res: Response) => {
  try {
    const items = db
      .prepare(
        `
      ${ITEM_SELECT}
      INNER JOIN favorites f ON f.item_id = m.id
      WHERE f.user_id = ? AND m.is_active = 1
      GROUP BY m.id ORDER BY f.added_at DESC
    `,
      )
      .all(req.user!.id) as any[];
    res.json(items.map(formatItem));
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /api/favorites/
router.post(
  "/",
  requireAuth,
  validate(AddFavoriteSchema),
  (req: Request, res: Response) => {
    try {
      db.prepare(
        "INSERT OR IGNORE INTO favorites (user_id, item_id) VALUES (?, ?)",
      ).run(req.user!.id, req.body.itemId);
      res.status(204).end();
    } catch (err: any) {
      res.status(500).json({ detail: err.message });
    }
  },
);

// DELETE /api/favorites/:itemId
router.delete("/:itemId", requireAuth, (req: Request, res: Response) => {
  try {
    db.prepare("DELETE FROM favorites WHERE user_id = ? AND item_id = ?").run(
      req.user!.id,
      req.params.itemId,
    );
    res.status(204).end();
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

export default router;
