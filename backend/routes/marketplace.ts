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

const CreateListingSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  listingType: z.enum(["sell", "share", "barter"]),
  condition: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  exchangeFor: z.string().optional(),
  imageUrl: z.string().optional(),
});

const UpdateListingSchema = CreateListingSchema.partial();

// GET /api/marketplace/
router.get("/", (req: Request, res: Response) => {
  try {
    const { seller, type, category, condition, q, min_price, max_price } =
      req.query as Record<string, string>;

    let sql = ITEM_SELECT + " WHERE m.is_active = 1";
    const params: (string | number)[] = [];

    if (seller) {
      sql += " AND m.seller_id = ?";
      params.push(seller);
    }
    if (type) {
      sql += " AND m.type = ?";
      params.push(type);
    }
    if (category) {
      sql += " AND m.category = ?";
      params.push(category);
    }
    if (condition) {
      sql += " AND m.condition = ?";
      params.push(condition);
    }
    if (min_price) {
      sql += " AND m.price >= ?";
      params.push(Number(min_price));
    }
    if (max_price) {
      sql += " AND m.price <= ?";
      params.push(Number(max_price));
    }
    if (q) {
      sql += " AND (m.title LIKE ? OR m.description LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }

    sql += " GROUP BY m.id ORDER BY m.created_at DESC";

    const items = db.prepare(sql).all(...(params as [])) as any[];
    res.json(items.map(formatItem));
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /api/marketplace/:id/
router.get("/:id", (req: Request, res: Response) => {
  try {
    const item = db
      .prepare(
        ITEM_SELECT + " WHERE m.is_active = 1 AND m.id = ? GROUP BY m.id",
      )
      .get(req.params.id) as any;
    if (!item) {
      res.status(404).json({ detail: "Item not found" });
      return;
    }
    res.json(formatItem(item));
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /api/marketplace/
router.post(
  "/",
  requireAuth,
  validate(CreateListingSchema),
  (req: Request, res: Response) => {
    try {
      const {
        title,
        category,
        listingType,
        condition,
        description,
        price,
        exchangeFor,
        imageUrl,
      } = req.body;
      const id = crypto.randomUUID();

      db.prepare(
        `
      INSERT INTO marketplace_items
        (id, seller_id, title, type, price, exchange_for, condition, category, description, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      ).run(
        id,
        req.user!.id,
        title,
        listingType,
        price ?? 0,
        exchangeFor ?? null,
        condition ?? null,
        category,
        description ?? null,
        imageUrl ?? null,
      );

      const item = db
        .prepare(ITEM_SELECT + " WHERE m.id = ? GROUP BY m.id")
        .get(id) as any;
      res.status(201).json(formatItem(item));
    } catch (err: any) {
      res.status(500).json({ detail: err.message });
    }
  },
);

// PUT /api/marketplace/:id/
router.put(
  "/:id",
  requireAuth,
  validate(UpdateListingSchema),
  (req: Request, res: Response) => {
    try {
      const existing = db
        .prepare("SELECT * FROM marketplace_items WHERE id = ?")
        .get(req.params.id) as any;
      if (!existing) {
        res.status(404).json({ detail: "Item not found" });
        return;
      }
      if (existing.seller_id !== req.user!.id && req.user!.role !== "admin") {
        res.status(403).json({ detail: "Forbidden" });
        return;
      }
      const {
        title,
        category,
        listingType,
        condition,
        description,
        price,
        exchangeFor,
        imageUrl,
      } = req.body;
      db.prepare(
        `
      UPDATE marketplace_items SET
        title        = COALESCE(?, title),
        category     = COALESCE(?, category),
        type         = COALESCE(?, type),
        condition    = COALESCE(?, condition),
        description  = COALESCE(?, description),
        price        = COALESCE(?, price),
        exchange_for = COALESCE(?, exchange_for),
        image_url    = COALESCE(?, image_url)
      WHERE id = ?
    `,
      ).run(
        title ?? null,
        category ?? null,
        listingType ?? null,
        condition ?? null,
        description ?? null,
        price ?? null,
        exchangeFor ?? null,
        imageUrl ?? null,
        req.params.id,
      );
      const updated = db
        .prepare(ITEM_SELECT + " WHERE m.id = ? GROUP BY m.id")
        .get(req.params.id) as any;
      res.json(formatItem(updated));
    } catch (err: any) {
      res.status(500).json({ detail: err.message });
    }
  },
);

// DELETE /api/marketplace/:id/ — soft delete
router.delete("/:id", requireAuth, (req: Request, res: Response) => {
  try {
    const existing = db
      .prepare("SELECT * FROM marketplace_items WHERE id = ?")
      .get(req.params.id) as any;
    if (!existing) {
      res.status(404).json({ detail: "Item not found" });
      return;
    }
    if (existing.seller_id !== req.user!.id && req.user!.role !== "admin") {
      res.status(403).json({ detail: "Forbidden" });
      return;
    }
    db.prepare("UPDATE marketplace_items SET is_active = 0 WHERE id = ?").run(
      req.params.id,
    );
    res.status(204).end();
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

export default router;
