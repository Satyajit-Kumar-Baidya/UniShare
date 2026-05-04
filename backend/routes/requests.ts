import { Router, Request, Response } from "express";
import { z } from "zod";
import db from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { getIo } from "../socket/emitter.js";

const router = Router();

const BorrowRequestSchema = z.object({
  itemId: z.string().min(1),
  message: z.string().optional(),
});

const TradeProposalSchema = z.object({
  itemId: z.string().min(1),
  offerDescription: z.string().min(1),
});

// POST /api/borrow-requests/ — create borrow request
router.post(
  "/borrow-requests/",
  requireAuth,
  validate(BorrowRequestSchema),
  (req: Request, res: Response) => {
    try {
      const { itemId, message } = req.body;
      const requesterId = req.user!.id;

      // Verify item exists
      const item = db
        .prepare("SELECT id, seller_id FROM marketplace_items WHERE id = ? AND is_active = 1")
        .get(itemId) as any;
      if (!item) {
        res.status(404).json({ detail: "Item not found" });
        return;
      }

      // Prevent user from borrowing their own items
      if (item.seller_id === requesterId) {
        res.status(400).json({ detail: "You cannot borrow your own items" });
        return;
      }

      // Check if already has pending request
      const existing = db
        .prepare(
          "SELECT id FROM borrow_requests WHERE requester_id = ? AND item_id = ? AND status = 'pending'",
        )
        .get(requesterId, itemId);
      if (existing) {
        res.status(400).json({ detail: "You already have a pending request for this item" });
        return;
      }

      const requestId = `br-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
      db.prepare(
        "INSERT INTO borrow_requests (id, requester_id, item_id, message, status) VALUES (?, ?, ?, ?, 'pending')",
      ).run(requestId, requesterId, itemId, message || null);

      // create a notification for the seller so they can see the request
      const notifId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
      const title = "New borrow request";
      const notifMessage = `${req.user!.name || requesterId} requested to borrow ${item.id}`;
      db.prepare(
        `INSERT INTO notifications (id, recipient_id, type, title, message, created_at) VALUES (?, ?, 'request', ?, ?, ?)`,
      ).run(notifId, item.seller_id, title, notifMessage, new Date().toISOString());

      // emit live notification if socket server present
      const io = getIo();
      if (io) {
        io.to(item.seller_id).emit("receive_notification", {
          id: notifId,
          type: "request",
          title,
          message: notifMessage,
          read: false,
          timestamp: new Date().toISOString(),
          recipientId: item.seller_id,
        });
      }

      res.status(201).json({
        id: requestId,
        requesterId,
        itemId,
        status: "pending",
        message,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ detail: err.message });
    }
  },
);

// POST /api/trade-proposals/ — create trade proposal
router.post(
  "/trade-proposals/",
  requireAuth,
  validate(TradeProposalSchema),
  (req: Request, res: Response) => {
    try {
      const { itemId, offerDescription } = req.body;
      const proposerId = req.user!.id;

      // Verify item exists
      const item = db
        .prepare("SELECT id, seller_id FROM marketplace_items WHERE id = ? AND is_active = 1")
        .get(itemId) as any;
      if (!item) {
        res.status(404).json({ detail: "Item not found" });
        return;
      }

      // Prevent user from trading their own items
      if (item.seller_id === proposerId) {
        res.status(400).json({ detail: "You cannot trade your own items" });
        return;
      }

      // Check if already has pending proposal
      const existing = db
        .prepare(
          "SELECT id FROM trade_proposals WHERE proposer_id = ? AND item_id = ? AND status = 'pending'",
        )
        .get(proposerId, itemId);
      if (existing) {
        res.status(400).json({ detail: "You already have a pending proposal for this item" });
        return;
      }

      const proposalId = `tp-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
      db.prepare(
        "INSERT INTO trade_proposals (id, proposer_id, item_id, offer_description, status) VALUES (?, ?, ?, ?, 'pending')",
      ).run(proposalId, proposerId, itemId, offerDescription);

      // notify seller
      const notifId2 = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
      const title2 = "New trade proposal";
      const notifMessage2 = `${req.user!.name || proposerId} proposed a trade for ${item.id}`;
      db.prepare(
        `INSERT INTO notifications (id, recipient_id, type, title, message, created_at) VALUES (?, ?, 'trade', ?, ?, ?)`,
      ).run(notifId2, item.seller_id, title2, notifMessage2, new Date().toISOString());

      const io2 = getIo();
      if (io2) {
        io2.to(item.seller_id).emit("receive_notification", {
          id: notifId2,
          type: "trade",
          title: title2,
          message: notifMessage2,
          read: false,
          timestamp: new Date().toISOString(),
          recipientId: item.seller_id,
        });
      }

      res.status(201).json({
        id: proposalId,
        proposerId,
        itemId,
        offerDescription,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ detail: err.message });
    }
  },
);

// GET /api/borrow-requests/ — get user's borrow requests (as requester)
router.get("/borrow-requests/", requireAuth, (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const requests = db
      .prepare(
        `SELECT br.*, m.title, m.seller_id
         FROM borrow_requests br
         JOIN marketplace_items m ON br.item_id = m.id
         WHERE br.requester_id = ?
         ORDER BY br.created_at DESC`,
      )
      .all(userId) as any[];
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /api/trade-proposals/ — get user's trade proposals (as proposer)
router.get("/trade-proposals/", requireAuth, (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const proposals = db
      .prepare(
        `SELECT tp.*, m.title, m.seller_id
         FROM trade_proposals tp
         JOIN marketplace_items m ON tp.item_id = m.id
         WHERE tp.proposer_id = ?
         ORDER BY tp.created_at DESC`,
      )
      .all(userId) as any[];
    res.json(proposals);
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

export default router;
