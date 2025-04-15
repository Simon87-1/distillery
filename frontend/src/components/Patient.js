import React, { useContext, useEffect, useState } from 'react';
import { FhirClientContext } from '../FhirClientContext';
import { jwtDecode } from 'jwt-decode';
import { Paper, Typography, Divider } from '@mui/material';
import { PersonOutline } from '@mui/icons-material';

function PatientName({ name = [] }) {
  let entry = name.find(nameRecord => nameRecord.use === 'official') || name[0];
  if (!entry) {
    return <h1>No Name</h1>;
  }
  return <h1>{entry.given.join(' ') + ' ' + entry.family}</h1>;
}

function PatientBanner(patient) {
  return (
    <Paper
      className="mb-4 flex px-6 py-4 text-white"
      sx={{
        background: 'linear-gradient(251.94deg, #14584A 0%, #143736 100%)',
        borderRadius: '14px',
      }}
    >
      <div className="flex items-center gap-4 pr-10">
        <div className="rounded-xl bg-green p-3">
          <img src="patient-logo.png" alt="Patient Logo" className="h-8" />
        </div>
        <div className="font-medium text-white">
          {<PatientName name={patient.name} />}
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
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState(null);

  const { client } = useContext(FhirClientContext);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        // For OSCAR, the patient comes back inside the access token
        const tokenResponse = client.state.tokenResponse;
        if (!tokenResponse.patient) {
          const accessToken = tokenResponse.access_token;
          const patient = jwtDecode(accessToken).context.patient;
          tokenResponse.patient = patient;
        }

        const patientData = await client.patient.read();
        setPatient(patientData);
        setLoading(false);

        console.log({ patientData });
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchPatient();
  }, [client]);

  if (loading) {
    return null;
  }
  if (error) {
    return error.message;
  }
  return <PatientBanner {...patient} />;
}

export default Patient;
