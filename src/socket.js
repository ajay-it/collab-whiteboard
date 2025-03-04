import { io } from "socket.io-client";
import { EVENTS } from "./utils/constants";

const socket = io(import.meta.env.VITE_BACKEND_URL);

socket.on(EVENTS.CONNECT, () => {
  console.log("Socket successfully connected!");
});

socket.on(EVENTS.DISCONNECT, () => {
  console.log("Socket disconnected");
});

export default socket;
