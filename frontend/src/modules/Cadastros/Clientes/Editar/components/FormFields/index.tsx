/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Controller, type Control } from 'react-hook-form';
import { TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, Checkbox, FormControlLabel } from '@mui/material';

interface BaseProps {
  name: string;
  control: Control<any>;
  label: string;
  disabled?: boolean;
}

interface FormInputProps extends BaseProps {
  mask?: (value: string) => string;
  type?: string;
  multiline?: boolean;
  rows?: number;
}

export const FormInput: React.FC<FormInputProps> = ({ name, control, label, mask, type = 'text', ...props }) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState: { error } }) => (
      <TextField
        {...field}
        {...props}
        type={type}
        label={label}
        fullWidth
        variant="outlined"
        error={!!error}
        helperText={error?.message}
        onChange={(e) => {
          const value = mask ? mask(e.target.value) : e.target.value;
          field.onChange(value);
        }}
        size="small" // Deixa o form mais compacto
      />
    )}
  />
);

interface FormSelectProps extends BaseProps {
  options: { value: string; label: string }[];
}

export const FormSelect: React.FC<FormSelectProps> = ({ name, control, label, options, disabled }) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState: { error } }) => (
      <FormControl fullWidth size="small" error={!!error} disabled={disabled}>
        <InputLabel>{label}</InputLabel>
        <Select {...field} label={label}>
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{error.message}</FormHelperText>}
      </FormControl>
    )}
  />
);

export const FormCheckbox: React.FC<Omit<BaseProps, 'label'> & { label: string }> = ({ name, control, label }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormControlLabel
        control={<Checkbox checked={field.value} onChange={field.onChange} />}
        label={label}
      />
    )}
  />
);