import { ConnectionStatus } from "@/types/common.types";
import { Message } from "@/types/Message.types";
import { WebSocketComponentHandle } from "@/types/WebSocketComponent.types";
import { createContext, RefObject, useContext } from "react";

interface WebSocketContextType {
  status: ConnectionStatus;
  webSocketRef: RefObject<WebSocketComponentHandle>;
  message: Message | null;
  progress: number;
  error: string | null;
  setMessage: React.Dispatch<React.SetStateAction<Message | null>>;
  setStatus: React.Dispatch<React.SetStateAction<ConnectionStatus>>;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider",
    );
  }
  return context;
};

export default WebSocketContext;
