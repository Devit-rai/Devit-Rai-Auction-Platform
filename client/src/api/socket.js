import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8000";

const getUserId = () => {
  try {
    const userData = JSON.parse(sessionStorage.getItem("user"));
    const user = userData?.user || userData;
    return user?._id || "";
  } catch {
    return "";
  }
};

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: true,
  query: {
    userId: getUserId(),
  },
});

socket.on("connect", () => {
  const userId = getUserId();
  if (userId) {
    socket.emit("joinUserRoom", userId);
  }
});

export const reconnectSocket = () => {
  const userId = getUserId();
  if (!userId) return;

  socket.io.opts.query = { userId };

  if (socket.connected) {
    socket.emit("joinUserRoom", userId);
  } else {
    socket.connect();
  }
};