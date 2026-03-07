import React, { useState, useEffect } from "react";
import ChatBox from "./ChatBox";
import { reconnectSocket } from "../api/socket";

const GlobalChatBox = () => {
  const [currentUser, setCurrentUser] = useState(null);

  const readUser = () => {
    try {
      const raw = sessionStorage.getItem("user");
      if (!raw) { setCurrentUser(null); return; }
      const parsed = JSON.parse(raw);
      const user   = parsed?.user || parsed;
      setCurrentUser(user?._id ? user : null);
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    readUser();

    window.addEventListener("storage", readUser);
    window.addEventListener("focus",   readUser);

    return () => {
      window.removeEventListener("storage", readUser);
      window.removeEventListener("focus",   readUser);
    };
  }, []);

  useEffect(() => {
    if (currentUser?._id) reconnectSocket();
  }, [currentUser?._id]);

  if (!currentUser) return null;

  return <ChatBox currentUser={currentUser} />;
};

export default GlobalChatBox;