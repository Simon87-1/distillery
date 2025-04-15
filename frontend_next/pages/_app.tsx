import "@/styles/global.css";
import React, { useState, useContext, useEffect, useRef } from "react";
import type { AppContext, AppProps } from "next/app";
import Script from "next/script";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import WebSocket from "@/components/WebSocket";
import FhirClientProvider from "@/context/FhirClientProvider";
import { jwtDecode } from "jwt-decode";
import { FhirClientContext } from "@/context/FhirClientContext";
import { useWebSocketContext } from "@/context/WebSocketContext";
import WebSocketProvider from "@/context/WebSocketProvider";
import NavigationHeader from "@/components/NavigationHeader";
import { Container } from "@mui/material";
import Patient from "@/components/Patient";
import ErrorPopup from "@/components/ErrorPopup";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import App from "next/app";
import { saveSetting } from "@/utils/localStorage";

const MuiTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = useTheme();

  const theme = createTheme({
    typography: {
      fontFamily: "Montserrat, Arial, sans-serif",
    },
    palette: {
      primary: {
        main: context.theme === "oscar" ? "#176E5B" : "#0090D9",
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "10px",
            padding: "14px 24px",
            textTransform: "none",
          },
        },
      },
    },
  });

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

const ws_url = "http://localhost:3000/ws/distill";

const WebsocketContent = ({ id }: { id: string }) => {
  const { webSocketRef, setMessage, setProgress, setStatus, setError } =
    useWebSocketContext();

  if (!id) return null;

  return (
    <WebSocket
      ref={webSocketRef}
      url={ws_url}
      providerId={id}
      onMessage={(event) => {
        const message = JSON.parse(event.data);
        if (message.progress) {
          setProgress(message.progress);
        } else {
          setMessage(message);
        }
      }}
      onStatusChange={setStatus}
      onError={setError}
    />
  );
};

export default function MyApp({ Component, pageProps }: AppProps) {
  const [providerId, setProviderId] = useState<string>("");

  useEffect(() => {
    saveSetting("selectedReports", []);
    saveSetting("selectedRange", null);
  }, []);

  const AppContent = () => {
    const { error, setError } = useWebSocketContext();
    const { client } = useContext(FhirClientContext) ?? {};
    const { setTheme, setEnv, env } = useTheme();

    useEffect(() => {
      if (client?.state?.tokenResponse?.id_token) {
        try {
          const decoded = jwtDecode(client.state.tokenResponse.id_token);
          setProviderId(decoded.sub as string);
        } catch (error) {
          console.error("Error decoding token:", error);
          setProviderId("");
        }
      }

      if (!env) setEnv(pageProps.env);
      if (pageProps.env.EMR) setTheme(pageProps.env.EMR);
    }, [client]);

    return (
      <div className="flex h-dvh flex-col pb-4">
        <Container maxWidth="xl">
          <NavigationHeader />
          <Patient />
        </Container>
        <Component {...pageProps} />
        <ErrorPopup
          open={Boolean(error)}
          onClose={() => setError(null)}
          message={error}
        />
      </div>
    );
  };

  return (
    <ThemeProvider>
      <MuiTheme>
        <Script
          src="https://cdn.jsdelivr.net/npm/pdfjs-lib@0.0.149/build/pdf.min.js"
          strategy="beforeInteractive"
        />
        <WebSocketProvider>
          <WebsocketContent id={providerId} />
          <FhirClientProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </FhirClientProvider>
        </WebSocketProvider>
      </MuiTheme>
    </ThemeProvider>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);
  return {
    ...appProps,
    pageProps: {
      ...appProps.pageProps,
      env: process.env,
    },
  };
};
