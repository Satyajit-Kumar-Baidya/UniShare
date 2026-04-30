import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import db from "../db/index.js";
import { JWT_SECRET } from "../middleware/auth.js";

interface JwtPayload {
  id: string;
  name: string;
  email: string;
}

interface AuthSocket extends Socket {
  userId: string;
  userName: string;
}

export function initSocket(io: Server) {
  // Authenticate every socket connection via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
      (socket as AuthSocket).userId = payload.id;
      (socket as AuthSocket).userName = payload.name;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (rawSocket) => {
    const socket = rawSocket as AuthSocket;
    const { userId, userName } = socket;

    console.log(`[socket] Connected: ${userName} (${userId})`);

    // Each user joins their own private room so we can target them specifically
    socket.join(userId);

    // Send only this user's messages and unread notifications on connect
    const messages = db
      .prepare(
        `
      SELECT m.id, m.sender_id AS senderId, m.receiver_id AS receiverId,
             m.content, m.read, m.created_at AS timestamp,
             su.name AS senderName, ru.name AS receiverName
      FROM messages m
      LEFT JOIN users su ON m.sender_id = su.id
      LEFT JOIN users ru ON m.receiver_id = ru.id
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY m.created_at ASC
    `,
      )
      .all(userId, userId) as any[];

    const notifications = db
      .prepare(
        `
      SELECT id, recipient_id AS recipientId, type, title, message, read,
             created_at AS timestamp
      FROM notifications
      WHERE recipient_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `,
      )
      .all(userId) as any[];

    socket.emit("init", { messages, notifications });

    // ----------------------------------------------------------------
    // send_message  { receiverId, content }
    // ----------------------------------------------------------------
    socket.on(
      "send_message",
      (msg: { receiverId: string; content: string }) => {
        const id = crypto.randomUUID();
        const timestamp = new Date().toISOString();

        db.prepare(
          `
        INSERT INTO messages (id, sender_id, receiver_id, content, created_at)
        VALUES (?, ?, ?, ?, ?)
      `,
        ).run(id, userId, msg.receiverId, msg.content, timestamp);

        const newMsg = {
          id,
          senderId: userId,
          senderName: userName,
          receiverId: msg.receiverId,
          content: msg.content,
          timestamp,
        };

        // Deliver to receiver's room and echo back to sender
        io.to(msg.receiverId).emit("receive_message", newMsg);
        socket.emit("receive_message", newMsg);

        // Auto-notify the receiver
        const notifId = crypto.randomUUID();
        db.prepare(
          `
        INSERT INTO notifications (id, recipient_id, type, title, message, created_at)
        VALUES (?, ?, 'message', 'New Message', ?, ?)
      `,
        ).run(
          notifId,
          msg.receiverId,
          `You have a new message from ${userName}`,
          timestamp,
        );

        io.to(msg.receiverId).emit("receive_notification", {
          id: notifId,
          type: "message",
          title: "New Message",
          message: `You have a new message from ${userName}`,
          read: false,
          timestamp,
          recipientId: msg.receiverId,
        });
      },
    );

    // ----------------------------------------------------------------
    // send_notification  { recipientId, type, title, message }
    // ----------------------------------------------------------------
    socket.on(
      "send_notification",
      (data: {
        recipientId: string;
        type: string;
        title: string;
        message: string;
      }) => {
        const id = crypto.randomUUID();
        const timestamp = new Date().toISOString();

        db.prepare(
          `
        INSERT INTO notifications (id, recipient_id, type, title, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        ).run(
          id,
          data.recipientId,
          data.type,
          data.title,
          data.message,
          timestamp,
        );

        io.to(data.recipientId).emit("receive_notification", {
          id,
          type: data.type,
          title: data.title,
          message: data.message,
          read: false,
          timestamp,
          recipientId: data.recipientId,
        });
      },
    );

    // ----------------------------------------------------------------
    // mark_notification_read  notificationId
    // ----------------------------------------------------------------
    socket.on("mark_notification_read", (notifId: string) => {
      // Only allow marking own notifications
      db.prepare(
        "UPDATE notifications SET read = 1 WHERE id = ? AND recipient_id = ?",
      ).run(notifId, userId);

      const notif = db
        .prepare("SELECT * FROM notifications WHERE id = ?")
        .get(notifId) as any;
      if (notif) {
        io.to(userId).emit("notification_updated", {
          id: notif.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          read: true,
          timestamp: notif.created_at,
          recipientId: notif.recipient_id,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[socket] Disconnected: ${userName} (${userId})`);
    });
  });
}
