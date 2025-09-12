"use client";

import { useSocket } from "../hooks/useSocket";
import { SocketContextType } from "../configs/configs";
import React, { createContext, useContext, ReactNode } from "react";

const SocketContext = createContext<SocketContextType | null>(null);

type ProviderProps = {
  children: ReactNode;
};

export const SocketProvider = ({ children }: ProviderProps) => {
  const socketState = useSocket();

  return <SocketContext.Provider value={socketState}>{children}</SocketContext.Provider>;
};

export const useSocketContext = (): SocketContextType => {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return ctx;
};
