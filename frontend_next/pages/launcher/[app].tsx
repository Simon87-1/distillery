import React, { useEffect } from "react";
import { oauth2 as SMART } from "fhirclient";
import config from "@/config";
import { FhirClientContext } from "@/context/FhirClientContext";
import { useRouter } from "next/router";
import { useContext } from "react";

export async function getServerSideProps(context) {
  const { app } = context.params;
  const emr = process.env.EMR;
  const clientId = process.env[`REACT_APP_CLIENT_ID_${emr}-provider-${app}`];

  return { props: { clientId, app, emr } };
}

interface LauncherProps {
  clientId: string;
  app: string;
  emr: string;
}

const Launcher: React.FC<LauncherProps> = ({ clientId, app, emr }) => {
  const router = useRouter();
  const context = useContext(FhirClientContext);

  const onChangeProvider = () => {
    const fhirconfig = config[`${emr}-provider-${app}`];

    if (!fhirconfig) {
      console.error(`No configuration found for provider: ${app}`);
      return;
    }

    if (clientId) {
      fhirconfig.client_id = clientId;
    }

    const options = {
      clientId: fhirconfig.client_id,
      scope: fhirconfig.scope,
      redirectUri: fhirconfig.redirectUri,
      completeInTarget: fhirconfig.completeInTarget,
      pkceMode: fhirconfig.pkceMode,
    };

    if (fhirconfig.client_id === "OPEN") {
      options.fhirServiceUrl = fhirconfig.url;
      options.patientId = fhirconfig.patientId;
    } else {
      options.iss = fhirconfig.url;
    }

    SMART.authorize(options);
  };

  // const renderOptions = () => {
  //   return Object.keys(config).map((configKey) => <option key={configKey}>{configKey}</option>);
  // };

  useEffect(() => {
    // Only run after the router is ready and we have the app parameter
    if (router.isReady && clientId) {
      onChangeProvider();
    }
  }, [router.isReady, clientId, context]);

  if (!router.isReady || !clientId) {
    return <div>Loading...</div>;
  }

  return null;
};

export default Launcher;
