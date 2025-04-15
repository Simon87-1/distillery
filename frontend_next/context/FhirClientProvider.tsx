import React, { useState, useEffect } from "react";
import { oauth2 as SMART } from "fhirclient";
import { FhirClientContext } from "@/context/FhirClientContext";
import { ProviderProps } from "@/types/common.types";
import Client from "fhirclient/lib/Client";

const FhirClientProvider = ({ children }: ProviderProps) => {
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!client) {
      SMART.ready().then(setClient).catch(setError);
    }
  }, [client]);

  // if (error) {
  //   console.log("Error:", error);
  //   return <pre>{error.message}</pre>;
  // }

  return (
    <FhirClientContext.Provider value={{ client }}>
      {children}
    </FhirClientContext.Provider>
  );
};

export default FhirClientProvider;
