import { Router, Request, Response } from "express";
import db from "../db/index.js";
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

// GET /api/seller/:id
router.get("/:id", (req: Request, res: Response) => {
  try {
    const seller = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(req.params.id) as any;
    if (!seller) {
      res.status(404).json({ detail: "Seller not found" });
      return;
    }

    const items = db
      .prepare(
        ITEM_SELECT +
          " WHERE m.seller_id = ? AND m.is_active = 1 GROUP BY m.id ORDER BY m.created_at DESC",
      )
      .all(req.params.id) as any[];

    const stats = db
      .prepare(
        "SELECT COALESCE(ROUND(AVG(rating), 1), 0) AS avg_rating, COUNT(*) AS count FROM reviews WHERE seller_id = ?",
      )
      .get(req.params.id) as any;

    res.json({
      sellerId: seller.id,
      sellerName: seller.name,
      sellerRating: stats?.avg_rating ?? 0,
      reviewsCount: stats?.count ?? 0,
      sellerLastActive: "Active recently",
      items: items.map(formatItem),
    });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

export default router;
