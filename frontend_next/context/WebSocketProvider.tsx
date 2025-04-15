import React, { useState, useRef, useEffect } from "react";
import WebSocketContext from "@/context/WebSocketContext";
import { Message } from "@/types/Message.types";
import { ConnectionStatus, ProviderProps } from "@/types/common.types";

const WebSocketProvider = ({ children }: ProviderProps) => {
  const webSocketRef = useRef(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [message, setMessage] = useState<Message | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);


  return (
    <WebSocketContext.Provider
      value={{
        status,
        webSocketRef,
        message,
        progress,
        error,
        setProgress,
        setMessage,
        setStatus,
        setError,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
