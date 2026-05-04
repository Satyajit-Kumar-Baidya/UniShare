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

const AddToCartSchema = z.object({
  itemId: z.string().min(1),
});

// GET /api/cart/
router.get("/", requireAuth, (req: Request, res: Response) => {
  try {
    const items = db
      .prepare(
        `
      ${ITEM_SELECT}
      INNER JOIN cart_items ci ON ci.item_id = m.id
      WHERE ci.user_id = ? AND m.is_active = 1
      GROUP BY m.id ORDER BY ci.added_at DESC
    `,
      )
      .all(req.user!.id) as any[];
    res.json(items.map(formatItem));
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /api/cart/
router.post(
  "/",
  requireAuth,
  validate(AddToCartSchema),
  (req: Request, res: Response) => {
    try {
      const { itemId } = req.body;
      const item = db
        .prepare(
          "SELECT id FROM marketplace_items WHERE id = ? AND is_active = 1",
        )
        .get(itemId);
      if (!item) {
        res.status(404).json({ detail: "Item not found" });
        return;
      }

      db.prepare(
        "INSERT OR IGNORE INTO cart_items (id, user_id, item_id) VALUES (?, ?, ?)",
      ).run(crypto.randomUUID(), req.user!.id, itemId);

      res.status(204).end();
    } catch (err: any) {
      res.status(500).json({ detail: err.message });
    }
  },
);

// DELETE /api/cart/:itemId
router.delete("/:itemId", requireAuth, (req: Request, res: Response) => {
  try {
    db.prepare("DELETE FROM cart_items WHERE user_id = ? AND item_id = ?").run(
      req.user!.id,
      req.params.itemId,
    );
    res.status(204).end();
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

export default router;
