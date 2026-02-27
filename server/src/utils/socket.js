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

    // Admin approves/rejects
    socket.on("adminApprovalUpdated", ({ auctionId, approvalStatus }) => {
      socket.broadcast.emit("auctionApprovalChanged", { auctionId, approvalStatus });
    });

    socket.on("joinAuction", (auctionId) => {
      socket.join(auctionId);
      console.log(`Socket ${socket.id} joined auction: ${auctionId}`);
    });

    socket.on("leaveAuction", (auctionId) => {
      socket.leave(auctionId);
      console.log(`Socket ${socket.id} left auction: ${auctionId}`);
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