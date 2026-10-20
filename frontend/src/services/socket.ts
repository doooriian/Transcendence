import { io } from "socket.io-client";

const socket = io({autoConnect: false});

socket.on("connect_error", (error) => {
  console.log(`Socket connection error: ${error.message}`);
});

export default socket;

