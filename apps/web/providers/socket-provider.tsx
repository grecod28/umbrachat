"use client";

import { getSocket } from "@/libs/socket";
import { createContext, useContext, useEffect } from "react";

// 1. Instanciamos el socket fuera para que sea un Singleton real
const socket = getSocket();
const SocketContext = createContext(socket);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 2. Conectar solo si no está conectado
    if (!socket.connected) socket.connect();

    // 3. Manejo de eventos de depuración
    const onConnect = () => console.log("Connected:", socket.id);
    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

// 4. Simplificamos el hook eliminando el chequeo de null (opcional)
export const useSocket = () => useContext(SocketContext);
