import { io } from "socket.io-client";

// Create a single Socket.IO instance shared by the frontend
const socket = io({autoConnect: false});

// Log Socket.IO connection errors
socket.on("connect_error", (error) => {
  console.log(`Socket connection error: ${error.message}`);
});

export default socket;

