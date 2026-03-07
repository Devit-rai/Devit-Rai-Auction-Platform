import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { getIO } from "../utils/socket.js";
import cloudinary from "../config/cloudinary.js";

const hasRole = (user, role) =>
  user?.roles?.some((r) => r.toLowerCase() === role.toLowerCase()) ?? false;

export const getChatUsers = async (req, res) => {
  try {
    const myId = req.user._id;
    const me   = await User.findById(myId).select("roles").lean();

    const iAmAdmin  = hasRole(me, "ADMIN");
    const iAmSeller = hasRole(me, "SELLER");

    // Build role filter
    let roleFilter;
    if (iAmAdmin) {
      roleFilter = { roles: { $elemMatch: { $regex: /^seller$/i } } };
    } else if (iAmSeller) {
      roleFilter = {
        $or: [
          { roles: { $elemMatch: { $regex: /^user$/i } } },
          { roles: { $elemMatch: { $regex: /^admin$/i } } },
        ],
      };
    } else {
      // Bidder sees only sellers
      roleFilter = { roles: { $elemMatch: { $regex: /^seller$/i } } };
    }

    const allUsers = await User.find({
      _id: { $ne: myId },
      status: { $nin: ["Banned", "Suspended"] },
      ...roleFilter,
    })
      .select("name email roles status isVerified profileImage")
      .lean();

    // Build conversation map
    const messages = await Message.find({
      $or: [{ senderId: myId }, { receiverId: myId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const conversationMap = new Map();
    messages.forEach((m) => {
      const otherId =
        m.senderId.toString() === myId.toString()
          ? m.receiverId.toString()
          : m.senderId.toString();
      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, m.text || "📷 Image");
      }
    });

    const result = allUsers.map((u) => ({
      ...u,
      lastMessage:     conversationMap.get(u._id.toString()) || null,
      hasConversation: conversationMap.has(u._id.toString()),
    }));

    result.sort((a, b) => {
      if (a.hasConversation && !b.hasConversation) return -1;
      if (!a.hasConversation && b.hasConversation) return 1;
      return a.name.localeCompare(b.name);
    });

    res.status(200).json({ users: result });
  } catch (error) {
    console.error("getChatUsers error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Invalid user ID" });

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { senderId: userId, receiverId: myId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { userId: receiverId } = req.params;
    const senderId = req.user._id;
    const { text, auctionId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(receiverId))
      return res.status(400).json({ message: "Invalid receiver ID" });

    if (!text && !req.files?.image)
      return res.status(400).json({ message: "Message cannot be empty" });

    let imageUrl;
    if (req.files?.image) {
      const uploadResponse = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        { folder: "chat_images" }
      );
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl,
      auctionId: auctionId || null,
    });

    const io = getIO();
    io.to(`user:${receiverId}`).emit("newMessage", newMessage);

    res.status(201).json({ message: newMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      isRead: false,
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};