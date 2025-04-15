import { ConnectionStatus, MessageRow } from "@/types/common.types";

interface SendMessageData {
  rows: MessageRow[];
  sections: unknown;
}

export interface WebSocketComponentProps {
  url: string;
  providerId: string;
  onMessage?: (event: MessageEvent) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  onError?: (error: string) => void;
}

export interface WebSocketComponentHandle {
  sendMessage: (message: SendMessageData) => void;
}
