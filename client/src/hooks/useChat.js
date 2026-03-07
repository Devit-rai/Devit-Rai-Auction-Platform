import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSocket } from "./useSocket"; 

const API = "/api/chat";

export const useChat = (currentUserId) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { socket, onlineUsers } = useSocket(currentUserId);

  // Fetch inbox
  const fetchChatUsers = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/users`, { withCredentials: true });
      setChatUsers(data.users);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchMessages = useCallback(async (userId) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/messages/${userId}`, {
        withCredentials: true,
      });
      setMessages(data.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(
    async ({ text, image, auctionId }) => {
      if (!selectedUser) return;
      try {
        const formData = new FormData();
        if (text) formData.append("text", text);
        if (image) formData.append("image", image);
        if (auctionId) formData.append("auctionId", auctionId);

        const { data } = await axios.post(
          `${API}/send/${selectedUser._id}`,
          formData,
          { withCredentials: true }
        );
        setMessages((prev) => [...prev, data.message]);
      } catch (err) {
        console.error(err);
      }
    },
    [selectedUser]
  );

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/unread-count`, {
        withCredentials: true,
      });
      setUnreadCount(data.count);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (selectedUser && msg.senderId === selectedUser._id) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setUnreadCount((c) => c + 1);
        fetchChatUsers();
      }
    };
    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [socket, selectedUser, fetchChatUsers]);

  useEffect(() => {
    fetchChatUsers();
    fetchUnreadCount();
  }, [fetchChatUsers, fetchUnreadCount]);

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser._id);
  }, [selectedUser, fetchMessages]);

  return {
    chatUsers,
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    unreadCount,
    onlineUsers,
    loading,
    fetchChatUsers,
  };
};