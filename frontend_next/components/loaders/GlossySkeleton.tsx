import React from "react";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import { keyframes } from "@mui/system";

const shimmer = keyframes`
  0% {
    transform: translate(-50%, -50%) rotate(10deg) translateX(-100%);
  }
  100% {
    transform: translate(-50%, -50%) rotate(90deg) translateX(100%);
  }
`;

export default function GlossySkeleton() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: "12px",
        background:
          "linear-gradient(135deg, #F0F3F7 25%, #E3E7EC 50%, #F8F9FB 75%)",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        animation="wave"
        sx={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(200, 200, 200, 0.1))",
          backdropFilter: "blur(8px)",
        }}
      />
    </Box>
  );
}
