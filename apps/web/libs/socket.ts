import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./constants/api";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}
