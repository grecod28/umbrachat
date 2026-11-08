"use client";

import {
  connectSocketWithSession,
  getSocket,
} from "@/libs/socket";
import { clearAnonymousSession, getAnonymousSessionToken } from "@/libs/session";
import { createContext, useContext, useEffect } from "react";

const socket = getSocket();
const SocketContext = createContext(socket);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cancelled = false;
    let retriedSession = false;

    const connect = async (forceRefresh = false) => {
      try {
        await connectSocketWithSession(forceRefresh);
      } catch {
        // A failed connection is surfaced by connect_error; the UI keeps working
        // while the socket reconnects in the background.
      }
    };

    void connect();

    const onConnect = () => {
      retriedSession = false;
      console.log("Connected:", socket.id);
    };

    const onConnectError = async (error: Error) => {
      const requiresNewSession =
        error.message === "SESSION_REQUIRED" ||
        error.message === "INVALID_SESSION";

      if (!cancelled && requiresNewSession && !retriedSession) {
        retriedSession = true;
        clearAnonymousSession();

        try {
          await connect(true);
        } catch {
          // The normal reconnect flow will keep trying.
        }
      }
    };

    const refreshAuthForReconnect = () => {
      void getAnonymousSessionToken()
        .then((token) => {
          socket.auth = { sessionToken: token };
        })
        .catch(() => {
          // If this fails, the socket reports connect_error.
        });
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.io.on("reconnect_attempt", refreshAuthForReconnect);

    return () => {
      cancelled = true;
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.io.off("reconnect_attempt", refreshAuthForReconnect);
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
