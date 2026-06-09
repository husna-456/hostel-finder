import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useSocketContext } from "./SocketContext";
import { useAuth } from "./AuthContext";
import { fetchClient } from "../api/fetchClient";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const socket          = useSocketContext();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ── Fetch from API ──────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await fetchClient("/notifications");
      if (!isMounted.current) return;
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (_) {}
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── Socket listener ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handler = ({ isNew, ...notification }) => {
      if (!isMounted.current) return;

      setNotifications((prev) => {
        // If same _id already exists → it's an update (e.g. NEW_MESSAGE count bump)
        const idx = prev.findIndex((n) => n._id === notification._id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = notification;
          return next;
        }
        // Brand-new notification → prepend
        return [notification, ...prev];
      });

      // Only increment unread count for genuinely new notifications
      if (isNew !== false) {
        setUnreadCount((c) => c + 1);
      }
    };

    socket.on("notification:new", handler);
    return () => socket.off("notification:new", handler);
  }, [socket]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const markRead = useCallback(async (id) => {
    // Optimistic
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await fetchClient(`/notifications/${id}/read`, { method: "PATCH" });
    } catch (_) {}
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await fetchClient("/notifications/mark-all-read", { method: "PATCH" });
    } catch (_) {}
  }, []);

  const deleteNotification = useCallback(async (id) => {
    setNotifications((prev) => {
      const removed = prev.find((n) => n._id === id);
      if (removed && !removed.isRead) setUnreadCount((c) => Math.max(0, c - 1));
      return prev.filter((n) => n._id !== id);
    });
    try {
      await fetchClient(`/notifications/${id}`, { method: "DELETE" });
    } catch (_) {}
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markRead, markAllRead, deleteNotification, refetch: fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
