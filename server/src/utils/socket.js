import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("joinUserRoom", (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket] ${socket.id} joined user room: user:${userId}`);
      }
    });

    socket.on("leaveUserRoom", (userId) => {
      if (userId) {
        socket.leave(`user:${userId}`);
      }
    });

    socket.on("adminApprovalUpdated", ({ auctionId, approvalStatus }) => {
      socket.broadcast.emit("auctionApprovalChanged", { auctionId, approvalStatus });
    });

    // Auction live countdown)
    socket.on("joinAuction", (auctionId) => {
      socket.join(auctionId);
      console.log(`[Socket] ${socket.id} joined auction: ${auctionId}`);
    });

    socket.on("leaveAuction", (auctionId) => {
      socket.leave(auctionId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized — call initSocket first");
  return io;
};