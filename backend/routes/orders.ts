import { Router, Request, Response } from "express";
import db from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const FEE_RATE = 0.05;

// POST /api/orders/ — checkout
router.post("/", requireAuth, (req: Request, res: Response) => {
  try {
    const buyerId = req.user!.id;

    const cartItems = db
      .prepare(
        `
      SELECT m.*, ci.id AS cart_id
      FROM marketplace_items m
      INNER JOIN cart_items ci ON ci.item_id = m.id
      WHERE ci.user_id = ? AND m.is_active = 1
    `,
      )
      .all(buyerId) as any[];

    if (cartItems.length === 0) {
      res.status(400).json({ detail: "Cart is empty" });
      return;
    }

    const subtotal = cartItems.reduce(
      (sum: number, item: any) => sum + (item.price ?? 0),
      0,
    );
    const fee = Number((subtotal * FEE_RATE).toFixed(2));
    const total = Number((subtotal + fee).toFixed(2));

    const orderId =
      "UNI-" + crypto.randomUUID().replace(/-/g, "").toUpperCase().slice(0, 8);

    db.prepare(
      `
      INSERT INTO orders (id, buyer_id, total_amount, fee, status)
      VALUES (?, ?, ?, ?, 'paid')
    `,
    ).run(orderId, buyerId, total, fee);

    for (const item of cartItems) {
      db.prepare(
        `
        INSERT INTO order_items (id, order_id, item_id, price_at_purchase)
        VALUES (?, ?, ?, ?)
      `,
      ).run(crypto.randomUUID(), orderId, item.id, item.price ?? 0);
    }

    // Clear the buyer's cart
    db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(buyerId);

    res
      .status(201)
      .json({ orderId, total, fee, subtotal, itemCount: cartItems.length });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /api/orders/ — buyer's history
router.get("/", requireAuth, (req: Request, res: Response) => {
  try {
    const orders = db
      .prepare(
        `
      SELECT o.*, COUNT(oi.id) AS item_count
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.buyer_id = ?
      GROUP BY o.id ORDER BY o.created_at DESC
    `,
      )
      .all(req.user!.id) as any[];
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /api/orders/:id
router.get("/:id", requireAuth, (req: Request, res: Response) => {
  try {
    const order = db
      .prepare("SELECT * FROM orders WHERE id = ? AND buyer_id = ?")
      .get(req.params.id, req.user!.id) as any;
    if (!order) {
      res.status(404).json({ detail: "Order not found" });
      return;
    }

    const items = db
      .prepare(
        `
      SELECT oi.*, m.title, m.type, m.image_url
      FROM order_items oi
      LEFT JOIN marketplace_items m ON oi.item_id = m.id
      WHERE oi.order_id = ?
    `,
      )
      .all(req.params.id) as any[];

    res.json({ ...order, items });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

export default router;
