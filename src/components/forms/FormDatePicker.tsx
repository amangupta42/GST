'use client';

import { TextField, TextFieldProps } from '@mui/material';
import { forwardRef } from 'react';

interface FormDatePickerProps extends Omit<TextFieldProps, 'type'> {
  // Add any additional date picker specific props here
}

export const FormDatePicker = forwardRef<HTMLDivElement, FormDatePickerProps>(
  ({ ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        type="date"
        variant="outlined"
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
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

FormDatePicker.displayName = 'FormDatePicker';