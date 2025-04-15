import { SvgIcon } from "@mui/material";
import React from "react";

export default function WarningIcon({ color = "#fff", ...props }) {
  return (
    <SvgIcon {...props}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.988 14.035L8.08698 3.61076C8.95349 2.12974 11.0465 2.12975 11.913 3.61077L18.0119 14.0351C18.9041 15.56 17.833 17.5 16.0989 17.5H3.90101C2.16691 17.5 1.09581 15.56 1.988 14.035Z"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 11.6667L10 6.66675"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 14.1667L10 14.0834"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  );
}
