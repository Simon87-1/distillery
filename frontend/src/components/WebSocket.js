import { useImperativeHandle, forwardRef, useState } from 'react';
import useWebSocket from 'react-use-websocket';

const WebSocketComponent = forwardRef(({ url, providerId, onMessage, onStatusChange }, ref) => {
  const [status, setStatus] = useState('connecting');
  const { sendMessage, lastMessage, readyState } = useWebSocket(url, {
    onOpen: () => {
      console.log('WebSocket opened');
      sendMessage(providerId);
      setStatus('open');
      if (onStatusChange) {
        onStatusChange('open');
      }
    },
    onMessage: (event) => {
      if (onMessage) {
        onMessage(event);
      }
    },
    onError: (error) => {
      console.log('WebSocket error', error);
      setStatus('error');
      if (onStatusChange) {
        onStatusChange('error');
      }
    },
    onClose: () => {
      console.log('WebSocket closed');
      setStatus('closed');
      if (onStatusChange) {
        onStatusChange('closed');
      }
    },
    shouldReconnect: (closeEvent) => {
      console.log('Attempting to reconnect...');
      return true; // Return true to attempt reconnection
    },
    reconnectInterval: 3000, // Time in ms between reconnection attempts
  });

  useImperativeHandle(ref, () => ({
    sendMessage: (message) => sendMessage(JSON.stringify(message)),
  }), [sendMessage]);

  return null;
});

export default WebSocketComponent;
