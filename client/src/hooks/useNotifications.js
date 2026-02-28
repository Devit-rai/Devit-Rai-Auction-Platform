// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { socket } from "../api/socket";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time notification pushed from server
  useEffect(() => {
    const onNew = (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnreadCount((n) => n + 1);
    };
    socket.on("newNotification", onNew);
    return () => socket.off("newNotification", onNew);
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((n) => Math.max(0, n - 1));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await api.delete("/notifications/clear");
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, clearAll, refetch: fetchNotifications };
};