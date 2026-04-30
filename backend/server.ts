import express from "express";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import net from "net";
import path from "path";
import fs from "fs";

// Boot DB and run migrations on startup
import "./db/index.js";

import { initSocket } from "./socket/index.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import marketplaceRouter from "./routes/marketplace.js";
import cosubsRouter from "./routes/cosubs.js";
import cartRouter from "./routes/cart.js";
import ordersRouter from "./routes/orders.js";
import verificationsRouter from "./routes/verifications.js";
import reviewsRouter from "./routes/reviews.js";
import favoritesRouter from "./routes/favorites.js";
import sellerRouter from "./routes/seller.js";

async function findAvailablePort(
  startPort: number,
  maxTries = 20,
): Promise<number> {
  for (let offset = 0; offset < maxTries; offset++) {
    const candidate = startPort + offset;
    const isAvailable = await new Promise<boolean>((resolve) => {
      const tester = net.createServer();
      tester.once("error", () => resolve(false));
      tester.once("listening", () => {
        tester.close(() => resolve(true));
      });
      tester.listen(candidate, "0.0.0.0");
    });
    if (isAvailable) return candidate;
  }
  throw new Error(`No free port found starting from ${startPort}.`);
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  const requestedPort = Number(process.env.PORT ?? "3000");
  const PORT = await findAvailablePort(requestedPort);

  // ── Body parsing (10 mb limit for base64 ID images) ───────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // ── REST API routes ────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/marketplace", marketplaceRouter);
  app.use("/api/co-subs", cosubsRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/verifications", verificationsRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/favorites", favoritesRouter);
  app.use("/api/seller", sellerRouter);

  // ── Socket.IO (authenticated, per-user rooms, DB-backed) ──────────
  initSocket(io);

  // ── Vite dev middleware / static production build ─────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: path.join(process.cwd(), "frontend"),
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: "spa",
      configFile: path.join(process.cwd(), "frontend", "vite.config.ts"),
    });
    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
      try {
        let template = fs.readFileSync(
          path.resolve(process.cwd(), "frontend", "index.html"),
          "utf-8",
        );
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "frontend", "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) =>
      res.sendFile(path.join(distPath, "index.html")),
    );
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    if (PORT !== requestedPort) {
      console.log(`Port ${requestedPort} was busy, using ${PORT} instead.`);
    }
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
