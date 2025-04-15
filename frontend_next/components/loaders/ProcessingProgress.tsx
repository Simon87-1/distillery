import React, { FC } from "react";
import { keyframes } from "@mui/system";
import Box from "@mui/material/Box";
import { useWebSocketContext } from "@/context/WebSocketContext";
import WarningIcon from "@/icons/WarningIcon";
import { useTheme } from "@/context/ThemeContext";

const moveStripes = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 50px 0;
  }
`;

interface ProcessingProgressProps {
  progress?: number;
}

const ProcessingProgress: FC<ProcessingProgressProps> = ({ progress = 75 }) => {
  const { error } = useWebSocketContext();
  const { theme } = useTheme();

  return (
    <div
      className={`absolute left-1/2 top-1/2 mx-auto w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform`}
    >
      {error ? (
        <div className="mb-4 flex gap-2">
          <WarningIcon color="#DA2A4B" />
          <h2>Error occurred while loading</h2>
        </div>
      ) : (
        <h2 className="mb-4">Processing Reports</h2>
      )}

      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "16px",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#f0f0f0",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: `${progress}%`,
            height: "100%",
            borderTopLeftRadius: "12px",
            borderBottomLeftRadius: "12px",
            background: error
              ? ""
              : `
              linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.15) 25%,
                transparent 25%,
                transparent 50%,
                rgba(255, 255, 255, 0.15) 50%,
                rgba(255, 255, 255, 0.15) 75%,
                transparent 75%
              )
            `,
            backgroundColor: error
              ? "#DA2A4B"
              : theme === "cerner"
                ? "#006fa8"
                : "#14735e",
            backgroundSize: "30px 30px",
            animation: `${moveStripes} 2s linear infinite`,
            transition: "width 0.5s ease-in-out",
          }}
        />
      </Box>
    </div>
  );
};

export default ProcessingProgress;
