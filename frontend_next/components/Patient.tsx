import React, { FC, useContext, useEffect, useState } from "react";
import { FhirClientContext } from "@/context/FhirClientContext";
import { jwtDecode } from "jwt-decode";
import { Paper, Typography, Divider } from "@mui/material";
import Image from "next/image";
import patientLogo from "@/images/patient-logo.png";
import type { Patient, PatientName } from "@/types/Client.types";
import { useRouter } from "next/router";
import PatientSkeleton from "@/components/loaders/PatientSkeleton";
import { useWebSocketContext } from "@/context/WebSocketContext";

interface PatientNameProps {
  name: PatientName[];
}

const PatientName: FC<PatientNameProps> = ({ name = [] }) => {
  const entry =
    name.find((nameRecord) => nameRecord.use === "official") || name[0];
  if (!entry) {
    return <h1>No Name</h1>;
  }
  return <h1>{entry.given.join(" ") + " " + entry.family}</h1>;
};

function PatientBanner(patient: Patient) {
  const router = useRouter();

  return (
    <Paper
      className="main-gradient flex px-6 py-4 text-white shadow-card"
      sx={{
        borderRadius: "14px",
        borderBottomLeftRadius: router.pathname === "/documents" ? 0 : "14px",
        borderBottomRightRadius: router.pathname === "/documents" ? 0 : "14px",
      }}
    >
      <div className="flex items-center gap-4 pr-10">
        <div className="rounded-xl bg-main p-3">
          <Image src={patientLogo} alt="Patient Logo" width={32} height={32} />
        </div>
        <div className="font-medium text-white">
          {<PatientName name={patient.name ?? []} />}
          <h3 className="text-white">ID:{patient.id}</h3>
        </div>
      </div>
      <Divider
        orientation="vertical"
        flexItem
        className="bg-white opacity-15"
      />
      <div className="flex items-center">
        <div className="px-10">
          <Typography variant="body2" className="text-white">
            Gender
          </Typography>
          <h3 className="text-base text-white">{patient.gender}</h3>
        </div>
        <Divider
          orientation="vertical"
          flexItem
          className="bg-white opacity-15"
        />
        <div className="px-10">
          <Typography variant="body2" className="text-white">
            Date of Birth
          </Typography>
          <h3 className="text-white">{patient.birthDate}</h3>
        </div>
        <Divider
          orientation="vertical"
          flexItem
          className="bg-white opacity-15"
        />
      </div>
    </Paper>
  );
}

function Patient() {
  const { setError } = useWebSocketContext();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);

  const { client } = useContext(FhirClientContext) ?? {};

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        // For OSCAR, the patient comes back inside the access token
        if (client) {
          const tokenResponse = client.state.tokenResponse;
          if (!tokenResponse?.patient) {
            const accessToken = tokenResponse?.access_token || "";
            const patient = (
              jwtDecode(accessToken) as { context: { patient: string } }
            ).context.patient;
            if (tokenResponse) tokenResponse.patient = patient;
          }

          const patientData = await client.patient.read();

          setPatient(patientData as unknown as Patient);
          setLoading(false);
        }
      } catch (error) {
        setError((error as Error).message);
        setLoading(false);
      }
    };

    fetchPatient();
  }, []);

  if (loading) {
    return <PatientSkeleton />;
  }
  return patient ? <PatientBanner {...patient} /> : null;
}

export default Patient;
