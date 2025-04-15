import React from "react";
import { ArrowBackIos } from "@mui/icons-material";
import { Button } from "@mui/material";
import Image from "next/image";
import companyLogo from "@/images/company_logo.png";
import { useWebSocketContext } from "@/context/WebSocketContext";
import { useRouter } from "next/router";

const NavigationHeader = () => {
  const { status } = useWebSocketContext();
  const router = useRouter();

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <Image
          src={companyLogo}
          alt="Pentavere Logo"
          height={32}
          width={165}
          priority
        />
        {router.pathname === "/documents" && (
          <Button
            startIcon={
              <ArrowBackIos
                style={{ fontSize: "14px" }}
                className="color-main"
              />
            }
            size="small"
            sx={{
              ".MuiButton-startIcon": {
                marginRight: 0,
              },
            }}
            className="p-1"
            onClick={() => router.back()}
          >
            <h3 className="color-main normal-case">Back</h3>
          </Button>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center gap-2 rounded-lg border border-light-gray px-4 py-2 shadow-card ${status === "open" ? "color-main" : "text-red"}`}
        >
          <div
            className={`h-2 w-2 rounded-full ${status === "open" ? "bg-main shadow-green" : "bg-red shadow-red"}`}
          ></div>
          <h4>DARWEN AI Status</h4>
        </div>
      </div>
    </div>
  );
};

export default NavigationHeader;
