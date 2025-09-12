'use client';

import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  SelectProps,
  FormControlProps 
} from '@mui/material';
import { forwardRef } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps extends Omit<SelectProps, 'variant'> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  FormControlProps?: Partial<FormControlProps>;
}

export const FormSelect = forwardRef<HTMLDivElement, FormSelectProps>(
  ({ 
    label, 
    options, 
    helperText, 
    error, 
    variant = 'outlined',
    FormControlProps,
    ...props 
  }, ref) => {
    const labelId = `select-${label?.replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <FormControl 
        variant={variant} 
        fullWidth 
        error={error}
        {...FormControlProps}
      >
        {label && (
          <InputLabel id={labelId} shrink={props.value !== ''}>
            {label}
          </InputLabel>
        )}
        <Select
          ref={ref}
          labelId={labelId}
          label={label}
          {...props}
          sx={{
            borderRadius: 2,
            ...props.sx,
          }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {helperText && (
          <FormHelperText>{helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }
);

FormSelect.displayName = 'FormSelect';