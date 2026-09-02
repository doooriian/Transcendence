import { io } from "socket.io-client";

// Create a single Socket.IO connection shared by the frontend
export const socket = io(import.meta.env.VITE_API_URL);
