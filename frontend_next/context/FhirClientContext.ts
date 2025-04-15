import Client from "fhirclient/lib/Client";
import React from "react";

type FhirClientContextType = {
  client: Client | null;
  patientId: string;
};

export const FhirClientContext = React.createContext<
  FhirClientContextType | undefined
>(undefined);
