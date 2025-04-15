import React, { FC, useEffect, useState } from "react";
import { Alert, IconButton, Slide, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@/icons/WarningIcon";
import { useWebSocketContext } from "@/context/WebSocketContext";

interface ErrorPopupProps {
  open: boolean;
  onClose: () => void;
  message?: string | null;
}

const ErrorPopup: FC<ErrorPopupProps> = ({ open, onClose, message }) => {
  const { setError } = useWebSocketContext();

  const [progress, setProgress] = useState(100);
  const TIMEOUT_DURATION = 6000; // 6 seconds
  
  useEffect(() => {
    if (open) {
      // Reset progress when popup opens
      setProgress(100);
      
      // Set timeout to close the popup after 6 seconds
      const closeTimeout = setTimeout(() => {
        setError(null);
      }, TIMEOUT_DURATION);
      
      // Update progress every 60ms for smooth animation
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          // Calculate new progress based on time remaining
          const newProgress = prevProgress - (100 / (TIMEOUT_DURATION / 60));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 60);
      
      // Clean up timeouts and intervals
      return () => {
        clearTimeout(closeTimeout);
        clearInterval(interval);
        setProgress(100);
      };
    }
  }, [open, setError]);

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-96"
      style={{ pointerEvents: open ? "auto" : "none" }}
      data-testid="error-popup"
    >
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Alert
          severity="error"
          className="bg-red-600 rounded-2xl p-4 text-white shadow-xl"
          icon={false}
          action={
            <div className="relative flex items-center justify-center" style={{ width: 28, height: 28 }}>
              <CircularProgress
                variant="determinate"
                value={progress}
                size={28}
                thickness={2}
                sx={{
                  color: 'white',
                  position: 'absolute',
                  zIndex: 1,
                }}
              />
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={onClose}
                sx={{ 
                  position: 'absolute',
                  zIndex: 2,
                  padding: '4px'
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          }
          sx={{
            background: "#DA2A4B",
            "& .MuiAlert-message": {
              padding: 0,
            },
            "& .MuiAlert-action": {
              padding: 0,
            },
          }}
        >
          <div className="flex gap-2">
            <WarningIcon />
            <h3 className="mb-1 font-bold">Error Occurred</h3>
          </div>
          <h4 className="font-bold">
            {message || "Something went wrong. Please try again."}
          </h4>
        </Alert>
      </Slide>
    </div>
  );
};

export default ErrorPopup;
