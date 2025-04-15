import React, { useState } from 'react';
import { Paper, Typography, IconButton, Divider } from '@mui/material';
import { ArrowBack, PersonOutline } from '@mui/icons-material';

const PatientHeader = ({ patient }) => {
  return (
    <Paper className="mb-6 bg-emerald-800 p-4 text-white">
      <div className="flex items-center gap-4">
        <IconButton className="text-white" size="small">
          <ArrowBack />
        </IconButton>
        <div className="flex items-center gap-4">
          <PersonOutline className="text-4xl" />
          <div>
            <Typography variant="h5">{patient.name}</Typography>
            <Typography variant="subtitle2">ID:{patient.id}</Typography>
          </div>
        </div>
      </div>
      <div className="mt-4 flex">
        <div className="px-4">
          <Typography variant="body2">Gender</Typography>
          <Typography variant="body1">{patient.gender}</Typography>
        </div>
        <Divider orientation="vertical" flexItem className="bg-white/30" />
        <div className="px-4">
          <Typography variant="body2">Date of Birth</Typography>
          <Typography variant="body1">{patient.dob}</Typography>
        </div>
        <Divider orientation="vertical" flexItem className="bg-white/30" />
      </div>
    </Paper>
  );
};

export default PatientHeader;
