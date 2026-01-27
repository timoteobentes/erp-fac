import React from 'react';
import { TextField } from '@mui/material';

interface InfoFieldProps {
  label: string;
  value: string | number | null | undefined;
  fullWidth?: boolean;
}

export const InfoField: React.FC<InfoFieldProps> = ({ label, value, fullWidth = false }) => {
  return (
    <TextField
      label={label}
      value={value || '-'}
      fullWidth={fullWidth}
      disabled
    />
  );
};