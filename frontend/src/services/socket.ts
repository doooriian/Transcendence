import { io } from "socket.io-client";

const socket = io({ autoConnect: false });

socket.on("connect_error", (error) => {
  if (
    error.message === "Invalid token" ||
    error.message === "Invalid or expired token" ||
    error.message === "Authentication token is required"
  ) {
    window.dispatchEvent(new Event("unauthorized"));
  }
});

export default socket;
