import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read?: boolean;
  status?: "sending" | "sent" | "failed";
  replyToId?: string | null;
  replyToContent?: string;
  replyToSenderName?: string;
  editedAt?: string | null;
  deletedAt?: string | null;
  reactions?: { userId: string; emoji: string }[];
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  recipientId: string;
}

interface SocketContextType {
  socket: Socket | null;
  messages: Message[];
  notifications: Notification[];
  sendMessage: (receiverId: string, content: string, replyToId?: string | null) => boolean;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  reactToMessage: (messageId: string, emoji: string) => void;
  sendTyping: (receiverId: string, isTyping: boolean) => void;
  sendNotification: (
    recipientId: string,
    type: string,
    title: string,
    message: string,
  ) => void;
  markNotificationRead: (id: string) => void;
  markThreadRead: (participantId: string) => void;
  typingByUserId: Record<string, boolean>;
  onlineUsers: string[];
  unreadNotificationsCount: number;
  unreadThreadCount: number;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadThreadIds, setUnreadThreadIds] = useState<string[]>([]);
  const [typingByUserId, setTypingByUserId] = useState<Record<string, boolean>>(
    {},
  );
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if user is logged in
    if (!user) {
      setSocket(null);
      setUnreadThreadIds([]);
      return;
    }

    const token = localStorage.getItem("unishare_access_token");
    const newSocket = io({ auth: { token } });
    setSocket(newSocket);

    newSocket.on(
      "init",
      (data: { messages: Message[]; notifications: Notification[] }) => {
        setMessages(data.messages);
        setNotifications(data.notifications);
        setUnreadThreadIds([]);
      },
    );

    newSocket.on("presence_state", (data: { onlineUsers: string[] }) => {
      setOnlineUsers(data.onlineUsers);
    });

    newSocket.on(
      "presence_update",
      (data: { onlineUsers: string[] }) => {
        setOnlineUsers(data.onlineUsers);
      },
    );

    newSocket.on("receive_message", (msg: Message) => {
      setMessages((prev) => {
        const existingIndex = prev.findIndex((m) => m.id === msg.id);
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = { ...next[existingIndex], ...msg, status: "sent" };
          return next;
        }
        return [...prev, { ...msg, status: "sent" }];
      });
      if (msg.receiverId === user.id) {
        setUnreadThreadIds((prev) =>
          prev.includes(msg.senderId) ? prev : [...prev, msg.senderId],
        );
      }
    });

    newSocket.on("message_updated", (msg: Message) => {
      setMessages((prev) =>
        prev.map((message) => (message.id === msg.id ? { ...message, ...msg } : message)),
      );
    });

    newSocket.on(
      "message_deleted",
      (payload: { messageId: string; deletedAt: string }) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === payload.messageId
              ? { ...message, content: "", deletedAt: payload.deletedAt }
              : message,
          ),
        );
      },
    );

    newSocket.on(
      "message_reaction_update",
      (payload: { messageId: string; reactions: { userId: string; emoji: string }[] }) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === payload.messageId
              ? { ...message, reactions: payload.reactions }
              : message,
          ),
        );
      },
    );

    newSocket.on("typing", (payload: { senderId: string; isTyping: boolean }) => {
      setTypingByUserId((prev) => ({
        ...prev,
        [payload.senderId]: payload.isTyping,
      }));
    });

    newSocket.on(
      "messages_read",
      (payload: { readerId: string; participantId: string }) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.senderId === user.id &&
            message.receiverId === payload.readerId
              ? { ...message, read: true }
              : message,
          ),
        );
      },
    );

    newSocket.on("receive_notification", (notif: Notification) => {
      setNotifications((prev) => [...prev, notif]);
    });

    newSocket.on("notification_updated", (updatedNotif: Notification) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n)),
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const sendMessage = (
    receiverId: string,
    content: string,
    replyToId?: string | null,
  ) => {
    if (!socket || !user) {
      return false;
    }

    const tempId = `temp-${Date.now()}`;
    const timestamp = new Date().toISOString();

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        senderId: user.id,
        senderName: user.name,
        receiverId,
        content,
        timestamp,
        read: false,
        status: "sending",
      },
    ]);

    socket.emit(
      "send_message",
      {
        receiverId,
        content,
        replyToId: replyToId ?? null,
      },
      (serverMsg: Message) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === tempId
              ? { ...serverMsg, status: "sent" }
              : message,
          ),
        );
      },
    );

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === tempId && message.status === "sending"
            ? { ...message, status: "failed" }
            : message,
        ),
      );
    }, 5000);

    return true;
  };

  const editMessage = (messageId: string, content: string) => {
    if (socket) {
      socket.emit("edit_message", { messageId, content });
    }
  };

  const deleteMessage = (messageId: string) => {
    if (socket) {
      socket.emit("delete_message", { messageId });
    }
  };

  const reactToMessage = (messageId: string, emoji: string) => {
    if (socket) {
      socket.emit("react_message", { messageId, emoji });
    }
  };

  const sendTyping = (receiverId: string, isTyping: boolean) => {
    if (socket && user) {
      socket.emit("typing", { receiverId, isTyping });
    }
  };

  const sendNotification = (
    recipientId: string,
    type: string,
    title: string,
    message: string,
  ) => {
    if (socket) {
      socket.emit("send_notification", {
        recipientId,
        type,
        title,
        message,
      });
    }
  };

  const markNotificationRead = (id: string) => {
    if (socket) {
      socket.emit("mark_notification_read", id);
    }
  };

  const markThreadRead = (participantId: string) => {
    setUnreadThreadIds((prev) => prev.filter((id) => id !== participantId));
    if (user) {
      setMessages((prev) =>
        prev.map((message) =>
          message.senderId === participantId && message.receiverId === user.id
            ? { ...message, read: true }
            : message,
        ),
      );
    }
    if (socket) {
      socket.emit("mark_thread_read", { participantId });
    }
  };

  // Filter notifications for current user
  const userNotifications = notifications.filter(
    (n) => n.recipientId === user?.id,
  );
  const unreadNotificationsCount = userNotifications.filter(
    (n) => !n.read,
  ).length;
  const unreadThreadCount = unreadThreadIds.length;

  return (
    <SocketContext.Provider
      value={{
        socket,
        messages,
        notifications: userNotifications,
        sendMessage,
        editMessage,
        deleteMessage,
        reactToMessage,
        sendTyping,
        sendNotification,
        markNotificationRead,
        markThreadRead,
        typingByUserId,
        onlineUsers,
        unreadNotificationsCount,
        unreadThreadCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
