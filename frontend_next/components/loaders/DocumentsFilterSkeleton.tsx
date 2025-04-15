import { Skeleton, Box } from "@mui/material";
import React from "react";

export default function ReportsFilterSkeleton() {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      data-testid="skeleton-loader"
    >
      <Skeleton variant="circular" width={24} height={24} />
      <Skeleton width={60} height={24} />
      <Box display="flex" gap={2} width="100%">
        {[1, 2, 3, 4, 5].map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            width="100%"
            height={48}
            sx={{ borderRadius: 2 }}
          />
        ))}
      </Box>
    </Box>
  );
}
