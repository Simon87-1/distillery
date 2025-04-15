import { SvgIcon } from "@mui/material";
import React from "react";

export default function DownloadIcon(props) {
  return (
    <SvgIcon {...props}>
      <svg
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7 10.9844L12 15.9844M12 15.9844L17 10.9844M12 15.9844V3.98438M3 13.9844L3 17.9844C3 20.1935 4.79086 21.9844 7 21.9844H17C19.2091 21.9844 21 20.1935 21 17.9844V13.9844"
          stroke="#0E0E0E"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  );
}
