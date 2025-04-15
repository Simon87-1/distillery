import React from "react";
import { Card, CardContent, Skeleton, Box } from "@mui/material";
import Grid from "@mui/material/Grid2";

export default function PatientSkeleton() {
  return (
    <Card
      sx={{
        display: "flex",
        p: 2,
        borderRadius: 3,
        boxShadow: 3,
        color: "white",
      }}
      className="main-gradient"
    >
      <Box sx={{ display: "flex", alignItems: "center", pr: 2 }}>
        <Skeleton
          variant="circular"
          width={60}
          height={60}
          sx={{ bgcolor: "#f7f7f9" }}
        />
      </Box>

      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 4,
          p: 0,
          paddingBottom: "0 !important",
        }}
      >
        <Box>
          <Skeleton
            variant="text"
            width={120}
            height={30}
            sx={{ bgcolor: "#f7f7f9" }}
          />
          <Skeleton
            variant="text"
            width={80}
            height={20}
            sx={{ bgcolor: "#f7f7f9" }}
          />
        </Box>

        <Grid container spacing={3} alignItems="center">
          {[...Array(4)].map((_, index) => (
            <Grid key={index}>
              <Skeleton
                variant="text"
                width={80}
                height={20}
                sx={{ bgcolor: "#f7f7f9" }}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
