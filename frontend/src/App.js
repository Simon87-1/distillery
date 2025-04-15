import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Launcher from './components/Launcher';
import Distillery from './components/Distillery';
import { Worker } from '@react-pdf-viewer/core';
import FhirClientProvider from './components/FhirClientProvider';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SummarySection from './components/SummarySection';

const theme = createTheme({
  typography: {
    fontFamily: 'Montserrat, Arial, sans-serif',
  },
  palette: {
    primary: {
      main: '#176E5B',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          padding: '14px 24px',
        },
      },
    },
  },
});

export default function App() {
  return (
    <div>
      <ThemeProvider theme={theme}>
        <FhirClientProvider>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <BrowserRouter>
              <Route path="/distillery" component={Distillery} />
              <Route path="/" component={Launcher} exact />
              <Route path="/launcher/:app" component={Launcher} />
            </BrowserRouter>
          </Worker>
        </FhirClientProvider>
        {/* <SummarySection /> */}
      </ThemeProvider>
    </div>
  );
}
