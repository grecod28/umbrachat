import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./constants/api";
import { getAnonymousSessionToken } from "./session";

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

export async function connectSocketWithSession(
  forceRefresh = false,
): Promise<Socket> {
  const token = await getAnonymousSessionToken(forceRefresh);
  const current = getSocket();

  current.auth = { sessionToken: token };

  if (current.connected) return current;

  await new Promise<void>((resolve, reject) => {
    const onConnect = () => {
      cleanup();
      resolve();
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const cleanup = () => {
      current.off("connect", onConnect);
      current.off("connect_error", onError);
    };

    current.once("connect", onConnect);
    current.once("connect_error", onError);
    current.connect();
  });

  return current;
}
