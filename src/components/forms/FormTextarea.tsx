'use client';

import { TextField, TextFieldProps } from '@mui/material';
import { forwardRef } from 'react';

interface FormTextareaProps extends Omit<TextFieldProps, 'multiline'> {
  rows?: number;
}

export const FormTextarea = forwardRef<HTMLDivElement, FormTextareaProps>(
  ({ rows = 4, ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        variant="outlined"
        fullWidth
        multiline
        rows={rows}
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

FormTextarea.displayName = 'FormTextarea';