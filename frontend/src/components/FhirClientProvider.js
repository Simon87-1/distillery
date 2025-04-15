import React, { useState, useEffect } from 'react';
import { oauth2 as SMART } from 'fhirclient';
import { FhirClientContext } from '../FhirClientContext';

// const FhirClientContext = React.createContext({});

const FhirClientProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!client) {
      SMART.ready().then(setClient).catch(setError);
    }
  }, [client]);

  if (error) {
    console.log('Error:', error);
    return <pre>{error.message}</pre>;
  }

  return (
    <FhirClientContext.Provider value={{ client }}>
      {client ? children : null}
    </FhirClientContext.Provider>
  );
};

export default FhirClientProvider;
