import { Router, Request, Response } from "express";
import { z } from "zod";
import db from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { formatGroup } from "../utils.js";

const router = Router();

const GROUP_SELECT = `
  SELECT g.*, u.name AS owner_name,
    COUNT(DISTINCT gm.id) AS filled_spots
  FROM subscription_groups g
  LEFT JOIN users u ON g.owner_id = u.id
  LEFT JOIN group_members gm ON gm.group_id = g.id
`;

const CreateGroupSchema = z.object({
  service: z.string().min(1),
  listingType: z.enum(["share", "sublet"]),
  monthlyCost: z.number().positive(),
  totalSpots: z.number().int().min(1).optional(),
  duration: z.number().int().min(1).optional(),
  description: z.string().optional(),
});

// GET /api/co-subs/
router.get("/", (_req: Request, res: Response) => {
  try {
    const groups = db
      .prepare(
        GROUP_SELECT +
          " WHERE g.is_active = 1 GROUP BY g.id ORDER BY g.created_at DESC",
      )
      .all() as any[];
    res.json(groups.map(formatGroup));
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /api/co-subs/:id/
router.get("/:id", (req: Request, res: Response) => {
  try {
    const group = db
      .prepare(
        GROUP_SELECT + " WHERE g.is_active = 1 AND g.id = ? GROUP BY g.id",
      )
      .get(req.params.id) as any;
    if (!group) {
      res.status(404).json({ detail: "Group not found" });
      return;
    }
    res.json(formatGroup(group));
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /api/co-subs/
router.post(
  "/",
  requireAuth,
  validate(CreateGroupSchema),
  (req: Request, res: Response) => {
    try {
      const {
        service,
        listingType,
        monthlyCost,
        totalSpots,
        duration,
        description,
      } = req.body;
      const id = crypto.randomUUID();
      const spots = listingType === "share" ? (totalSpots ?? 2) : 1;

      db.prepare(
        `
      INSERT INTO subscription_groups
        (id, owner_id, service, type, total_price, total_spots, description, duration_months)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      ).run(
        id,
        req.user!.id,
        service,
        listingType,
        monthlyCost,
        spots,
        description ?? null,
        duration ?? null,
      );

      // Owner auto-joins as first member for share type
      if (listingType === "share") {
        db.prepare(
          "INSERT INTO group_members (id, group_id, user_id) VALUES (?, ?, ?)",
        ).run(crypto.randomUUID(), id, req.user!.id);
      }

      const group = db
        .prepare(GROUP_SELECT + " WHERE g.id = ? GROUP BY g.id")
        .get(id) as any;
      res.status(201).json(formatGroup(group));
    } catch (err: any) {
      res.status(500).json({ detail: err.message });
    }
  },
);

// POST /api/co-subs/:id/join
router.post("/:id/join", requireAuth, (req: Request, res: Response) => {
  try {
    const group = db
      .prepare(
        GROUP_SELECT + " WHERE g.is_active = 1 AND g.id = ? GROUP BY g.id",
      )
      .get(req.params.id) as any;
    if (!group) {
      res.status(404).json({ detail: "Group not found" });
      return;
    }
    if (Number(group.filled_spots) >= Number(group.total_spots)) {
      res.status(400).json({ detail: "Group is full" });
      return;
    }
    const alreadyMember = db
      .prepare(
        "SELECT id FROM group_members WHERE group_id = ? AND user_id = ?",
      )
      .get(req.params.id, req.user!.id);
    if (alreadyMember) {
      res.status(400).json({ detail: "Already a member" });
      return;
    }

    db.prepare(
      "INSERT INTO group_members (id, group_id, user_id) VALUES (?, ?, ?)",
    ).run(crypto.randomUUID(), req.params.id, req.user!.id);

    const updated = db
      .prepare(GROUP_SELECT + " WHERE g.id = ? GROUP BY g.id")
      .get(req.params.id) as any;
    res.json(formatGroup(updated));
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// DELETE /api/co-subs/:id/leave
router.delete("/:id/leave", requireAuth, (req: Request, res: Response) => {
  try {
    const group = db
      .prepare("SELECT * FROM subscription_groups WHERE id = ?")
      .get(req.params.id) as any;
    if (!group) {
      res.status(404).json({ detail: "Group not found" });
      return;
    }

    db.prepare(
      "DELETE FROM group_members WHERE group_id = ? AND user_id = ?",
    ).run(req.params.id, req.user!.id);

    const updated = db
      .prepare(GROUP_SELECT + " WHERE g.id = ? GROUP BY g.id")
      .get(req.params.id) as any;
    res.json(formatGroup(updated));
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// DELETE /api/co-subs/:id
router.delete("/:id", requireAuth, (req: Request, res: Response) => {
  try {
    const group = db
      .prepare("SELECT * FROM subscription_groups WHERE id = ?")
      .get(req.params.id) as any;
    if (!group) {
      res.status(404).json({ detail: "Group not found" });
      return;
    }
    if (group.owner_id !== req.user!.id && req.user!.role !== "admin") {
      res.status(403).json({ detail: "Forbidden" });
      return;
    }
    db.prepare("UPDATE subscription_groups SET is_active = 0 WHERE id = ?").run(
      req.params.id,
    );
    res.status(204).end();
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

export default router;
