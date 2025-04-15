import React, { useRef, useState } from 'react';
import Container from '@mui/material/Container';
import FhirClientProvider from './FhirClientProvider';
import Patient from './Patient';
import DocumentList from './DocumentList';
import Summary from './Summary';
import Settings from './Settings';
import PatientHeader from './PatientHeader';
import NavigationHeader from './NavigationHeader';

/**
 * Wraps everything into `FhirClientProvider` so that any component
 * can have access to the fhir client through the context.
 */
const Distillery = () => {
  const [message, setMessage] = useState(null);
  const ws_url = 'http://localhost:3000/ws/distill';
  const docsRef = useRef([]);

  const updateDocs = docs => {
    docsRef.current = docs;
  };

  return (
    <Container
      maxWidth="xl"
      className="h-screen flex-col"
      style={{ display: 'flex' }}
    >
      <FhirClientProvider>
        <NavigationHeader />
        <Patient />
        {/* <PatientHeader /> */}
        <div className="hidden">
          <Settings />
        </div>
        <div className="h-full">
          <div className='hidden'>
            <DocumentList
              updateMessage={setMessage}
              updateDocs={updateDocs}
              ws_url={ws_url}
            />
          </div>
          <Summary message={message} docs={docsRef.current} />
        </div>
      </FhirClientProvider>
    </Container>
  );
};

export default Distillery;
