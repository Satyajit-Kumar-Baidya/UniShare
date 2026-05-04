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

const onlineUsers = new Set<string>();

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
    onlineUsers.add(userId);
    io.emit("presence_update", {
      userId,
      status: "online",
      lastSeen: null,
      onlineUsers: Array.from(onlineUsers),
    });

    // Send only this user's messages and unread notifications on connect
    const messages = db
      .prepare(
        `
      SELECT m.id, m.sender_id AS senderId, m.receiver_id AS receiverId,
             m.content, m.read, m.created_at AS timestamp,
             m.reply_to AS replyToId, m.edited_at AS editedAt,
             m.deleted_at AS deletedAt,
             su.name AS senderName, ru.name AS receiverName,
             rm.content AS replyToContent,
             rsu.name AS replyToSenderName
      FROM messages m
      LEFT JOIN users su ON m.sender_id = su.id
      LEFT JOIN users ru ON m.receiver_id = ru.id
      LEFT JOIN messages rm ON rm.id = m.reply_to
      LEFT JOIN users rsu ON rm.sender_id = rsu.id
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY m.created_at ASC
    `,
      )
      .all(userId, userId) as any[];

    const reactions = db
      .prepare(
        `
      SELECT mr.message_id AS messageId, mr.user_id AS userId, mr.emoji
      FROM message_reactions mr
      INNER JOIN messages m ON m.id = mr.message_id
      WHERE m.sender_id = ? OR m.receiver_id = ?
    `,
      )
      .all(userId, userId) as any[];

    const reactionMap = reactions.reduce(
      (acc: Record<string, { userId: string; emoji: string }[]>, row) => {
        if (!acc[row.messageId]) {
          acc[row.messageId] = [];
        }
        acc[row.messageId].push({ userId: row.userId, emoji: row.emoji });
        return acc;
      },
      {},
    );

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

    const hydratedMessages = messages.map((msg) => ({
      ...msg,
      reactions: reactionMap[msg.id] ?? [],
    }));

    socket.emit("init", { messages: hydratedMessages, notifications });
    socket.emit("presence_state", { onlineUsers: Array.from(onlineUsers) });

    // ----------------------------------------------------------------
    // send_message  { receiverId, content }
    // ----------------------------------------------------------------
    socket.on(
      "send_message",
      (
        msg: { receiverId: string; content: string; replyToId?: string | null },
        ack?: (data: any) => void,
      ) => {
        const id = crypto.randomUUID();
        const timestamp = new Date().toISOString();

        db.prepare(
          `
        INSERT INTO messages (id, sender_id, receiver_id, content, reply_to, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        ).run(
          id,
          userId,
          msg.receiverId,
          msg.content,
          msg.replyToId ?? null,
          timestamp,
        );

        const reply = msg.replyToId
          ? (db
              .prepare(
                "SELECT m.content, u.name AS senderName FROM messages m LEFT JOIN users u ON m.sender_id = u.id WHERE m.id = ?",
              )
              .get(msg.replyToId) as any)
          : null;

        const newMsg = {
          id,
          senderId: userId,
          senderName: userName,
          receiverId: msg.receiverId,
          content: msg.content,
          timestamp,
          read: false,
          replyToId: msg.replyToId ?? null,
          replyToContent: reply?.content ?? undefined,
          replyToSenderName: reply?.senderName ?? undefined,
          editedAt: null,
          deletedAt: null,
          reactions: [],
        };

        // Deliver to receiver's room and echo back to sender
        io.to(msg.receiverId).emit("receive_message", newMsg);
        socket.emit("receive_message", newMsg);
        if (ack) {
          ack(newMsg);
        }

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

    socket.on(
      "edit_message",
      (payload: { messageId: string; content: string }) => {
        const existing = db
          .prepare("SELECT * FROM messages WHERE id = ?")
          .get(payload.messageId) as any;
        if (!existing || existing.sender_id !== userId) {
          return;
        }
        const editedAt = new Date().toISOString();
        db.prepare(
          "UPDATE messages SET content = ?, edited_at = ? WHERE id = ?",
        ).run(payload.content, editedAt, payload.messageId);

        const updated = db
          .prepare(
            `
          SELECT m.id, m.sender_id AS senderId, m.receiver_id AS receiverId,
                 m.content, m.read, m.created_at AS timestamp,
                 m.reply_to AS replyToId, m.edited_at AS editedAt,
                 m.deleted_at AS deletedAt,
                 su.name AS senderName, ru.name AS receiverName,
                 rm.content AS replyToContent,
                 rsu.name AS replyToSenderName
          FROM messages m
          LEFT JOIN users su ON m.sender_id = su.id
          LEFT JOIN users ru ON m.receiver_id = ru.id
          LEFT JOIN messages rm ON rm.id = m.reply_to
          LEFT JOIN users rsu ON rm.sender_id = rsu.id
          WHERE m.id = ?
        `,
          )
          .get(payload.messageId) as any;

        io.to(updated.receiverId).emit("message_updated", updated);
        socket.emit("message_updated", updated);
      },
    );

    socket.on("delete_message", (payload: { messageId: string }) => {
      const existing = db
        .prepare("SELECT * FROM messages WHERE id = ?")
        .get(payload.messageId) as any;
      if (!existing || existing.sender_id !== userId) {
        return;
      }
      const deletedAt = new Date().toISOString();
      db.prepare(
        "UPDATE messages SET content = '', deleted_at = ? WHERE id = ?",
      ).run(deletedAt, payload.messageId);

      io.to(existing.receiver_id).emit("message_deleted", {
        messageId: payload.messageId,
        deletedAt,
      });
      socket.emit("message_deleted", {
        messageId: payload.messageId,
        deletedAt,
      });
    });

    socket.on(
      "react_message",
      (payload: { messageId: string; emoji: string }) => {
        const existing = db
          .prepare(
            "SELECT id FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?",
          )
          .get(payload.messageId, userId, payload.emoji);

        if (existing) {
          db.prepare(
            "DELETE FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?",
          ).run(payload.messageId, userId, payload.emoji);
        } else {
          db.prepare(
            "INSERT INTO message_reactions (id, message_id, user_id, emoji) VALUES (?, ?, ?, ?)",
          ).run(crypto.randomUUID(), payload.messageId, userId, payload.emoji);
        }

        const updatedReactions = db
          .prepare(
            "SELECT message_id AS messageId, user_id AS userId, emoji FROM message_reactions WHERE message_id = ?",
          )
          .all(payload.messageId) as any[];

        const messageRow = db
          .prepare("SELECT sender_id, receiver_id FROM messages WHERE id = ?")
          .get(payload.messageId) as any;
        if (!messageRow) {
          return;
        }

        const updatePayload = {
          messageId: payload.messageId,
          reactions: updatedReactions.map((row) => ({
            userId: row.userId,
            emoji: row.emoji,
          })),
        };

        io.to(messageRow.receiver_id).emit("message_reaction_update", updatePayload);
        io.to(messageRow.sender_id).emit("message_reaction_update", updatePayload);
      },
    );

    // ----------------------------------------------------------------
    // typing  { receiverId, isTyping }
    // ----------------------------------------------------------------
    socket.on(
      "typing",
      (payload: { receiverId: string; isTyping: boolean }) => {
        io.to(payload.receiverId).emit("typing", {
          senderId: userId,
          isTyping: payload.isTyping,
        });
      },
    );

    // ----------------------------------------------------------------
    // mark_thread_read  { participantId }
    // ----------------------------------------------------------------
    socket.on("mark_thread_read", (data: { participantId: string }) => {
      db.prepare(
        "UPDATE messages SET read = 1 WHERE receiver_id = ? AND sender_id = ?",
      ).run(userId, data.participantId);

      io.to(data.participantId).emit("messages_read", {
        readerId: userId,
        participantId: data.participantId,
      });
    });

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
      onlineUsers.delete(userId);
      io.emit("presence_update", {
        userId,
        status: "offline",
        lastSeen: new Date().toISOString(),
        onlineUsers: Array.from(onlineUsers),
      });
    });
  });
}
