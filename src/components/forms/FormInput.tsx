'use client';

import { TextField, TextFieldProps } from '@mui/material';
import { forwardRef } from 'react';

interface FormInputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
}

export const FormInput = forwardRef<HTMLDivElement, FormInputProps>(
  ({ variant = 'outlined', ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        variant={variant}
        fullWidth
        {...props}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
          ...props.sx,
        }}
      />
    );
  }
);

FormInput.displayName = 'FormInput';