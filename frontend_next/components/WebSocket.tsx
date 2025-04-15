import {
  WebSocketComponentProps,
  WebSocketComponentHandle,
} from "../types/WebSocketComponent.types";
import { useImperativeHandle, forwardRef } from "react";
import useWebSocket from "react-use-websocket";

const WebSocketComponent = forwardRef<
  WebSocketComponentHandle,
  WebSocketComponentProps
>(({ url, providerId, onMessage, onStatusChange, onError }, ref) => {
  const { sendMessage } = useWebSocket(providerId ? url : null, {
    onOpen: () => {
      console.log("WebSocket opened");
      if (providerId) {
        sendMessage(providerId);
      }
      if (onStatusChange) {
        onStatusChange("open");
      }
    },
    onMessage: (event) => {
      console.log("on message");
      if (onMessage) {
        onMessage(event);
      }
    },
    onError: (error) => {
      const ws = error.currentTarget;
      const errorMessage = `WebSocket connection to ${ws?.url} failed`;

      console.log("WebSocket error", errorMessage);

      if (onStatusChange) {
        console.log("onstatuschange error");

        onStatusChange("error");
      }
      if (onError) {
        onError(errorMessage);
      }
    },
    onClose: () => {
      console.log("WebSocket closed");
      if (onStatusChange) {
        onStatusChange("closed");
      }
    },
    shouldReconnect: () => {
      console.log("Attempting to reconnect...");
      return true; // Return true to attempt reconnection
    },
    reconnectInterval: 3000, // Time in ms between reconnection attempts
  });

  useImperativeHandle(
    ref,
    () => ({
      sendMessage: (message) => sendMessage(JSON.stringify(message)),
    }),
    [sendMessage],
  );

  return null;
});

WebSocketComponent.displayName = "WebSocket";

export default WebSocketComponent;
