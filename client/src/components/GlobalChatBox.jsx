import React, { useState, useEffect } from "react";
import ChatBox from "./ChatBox";
import { reconnectSocket } from "../api/socket";

/**
 * GlobalChatBox
 * ─────────────
 * Mount this ONCE in App.jsx (outside all routes).
 * It reads the logged-in user from sessionStorage on every
 * route change and renders ChatBox only when a user is logged in.
 *
 * This means you do NOT need to add ChatBox to any individual page.
 * Remove any existing <ChatBox /> imports from:
 *   - UserDashboard.jsx
 *   - SellerDashboard.jsx
 *   - SellerProfile.jsx
 *   - AdminDashboard.jsx
 *   - Inventory.jsx  (if added)
 *   - BidHistory.jsx (if added)
 *   - Auction.jsx / AuctionDetails.jsx (if added)
 */
const GlobalChatBox = () => {
  const [currentUser, setCurrentUser] = useState(null);

  // Re-read user on every focus/storage change (login / logout)
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

    // Re-check when another tab logs in/out or when window regains focus
    window.addEventListener("storage", readUser);
    window.addEventListener("focus",   readUser);

    return () => {
      window.removeEventListener("storage", readUser);
      window.removeEventListener("focus",   readUser);
    };
  }, []);

  // Whenever we get a valid user, make sure socket registers them as online
  useEffect(() => {
    if (currentUser?._id) reconnectSocket();
  }, [currentUser?._id]);

  // Don't render on auth / landing pages where no user exists
  if (!currentUser) return null;

  return <ChatBox currentUser={currentUser} />;
};

export default GlobalChatBox;