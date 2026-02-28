import { Notification } from "../models/Notification.js";
import { getIO } from "./socket.js";
import User from "../models/User.js";

export const createNotification = async ({
  recipientId,
  recipientRole,
  type,
  title,
  message,
  auctionId = null,
  auctionTitle = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      recipientRole,
      type,
      title,
      message,
      auctionId,
      auctionTitle,
    });

    const room = `user:${recipientId.toString()}`;
    getIO().to(room).emit("newNotification", {
      _id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      auctionId: notification.auctionId,
      auctionTitle: notification.auctionTitle,
      isRead: false,
      createdAt: notification.createdAt,
    });

    console.log(`[Notification] ✓ Saved & emitted to ${room}: "${title}"`);
    return notification;
  } catch (err) {
    console.error("[Notification] createNotification FAILED:", err.message);
    console.error(err.stack);
  }
};

export const notifyAdmins = async ({ type, title, message, auctionId, auctionTitle }) => {
  try {
    const admins = await User.find({ roles: { $in: ["ADMIN"] } }).select("_id name");
    console.log(`[Notification] notifyAdmins → found ${admins.length} admin(s)`);

    if (admins.length === 0) {
      const sample = await User.findOne({}).select("roles");
      console.warn(`[Notification] No ADMIN users found. Sample roles in DB: ${JSON.stringify(sample?.roles)}`);
      return;
    }

    await Promise.all(
      admins.map((admin) =>
        createNotification({
          recipientId:   admin._id,
          recipientRole: "ADMIN",
          type,
          title,
          message,
          auctionId,
          auctionTitle,
        })
      )
    );
  } catch (err) {
    console.error("[Notification] notifyAdmins FAILED:", err.message);
    console.error(err.stack);
  }
};

export const notifyBidders = async ({ auction, type, title, message }) => {
  try {
    const bidderIds = [
      ...new Set(
        (auction.bids || []).map((b) => b.userId?.toString()).filter(Boolean)
      ),
    ];
    await Promise.all(
      bidderIds.map((userId) =>
        createNotification({
          recipientId:   userId,
          recipientRole: "USER",
          type,
          title,
          message,
          auctionId: auction._id,
          auctionTitle: auction.title,
        })
      )
    );
  } catch (err) {
    console.error("[Notification] notifyBidders FAILED:", err.message);
  }
};