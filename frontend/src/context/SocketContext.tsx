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
  sendMessage: (receiverId: string, content: string) => void;
  sendNotification: (
    recipientId: string,
    type: string,
    title: string,
    message: string,
  ) => void;
  markNotificationRead: (id: string) => void;
  markThreadRead: (participantId: string) => void;
  unreadNotificationsCount: number;
  unreadThreadCount: number;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadThreadIds, setUnreadThreadIds] = useState<string[]>([]);
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

    newSocket.on("receive_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.receiverId === user.id) {
        setUnreadThreadIds((prev) =>
          prev.includes(msg.senderId) ? prev : [...prev, msg.senderId],
        );
      }
    });

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

  const sendMessage = (receiverId: string, content: string) => {
    if (socket && user) {
      socket.emit("send_message", {
        senderId: user.id,
        senderName: user.name,
        receiverId,
        content,
      });
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
        sendNotification,
        markNotificationRead,
        markThreadRead,
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
