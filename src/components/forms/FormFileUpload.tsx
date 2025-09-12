'use client';

import { 
  Box, 
  Button, 
  Typography, 
  Paper,
  IconButton,
  Chip
} from '@mui/material';
import { 
  CloudUpload as UploadIcon, 
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon 
} from '@mui/icons-material';
import { forwardRef, useRef, useState } from 'react';

interface FormFileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  helperText?: string;
  error?: boolean;
  onChange?: (files: File[]) => void;
  disabled?: boolean;
}

export const FormFileUpload = forwardRef<HTMLInputElement, FormFileUploadProps>(
  ({ 
    label = 'Upload Files',
    accept,
    multiple = false,
    maxSize = 10,
    helperText,
    error,
    onChange,
    disabled = false,
    ...props 
  }, ref) => {
    const [files, setFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (fileList: FileList | null) => {
      if (!fileList) return;
      
      const newFiles = Array.from(fileList).filter(file => {
        if (file.size > maxSize * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
          return false;
        }
        return true;
      });

      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
    };

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    };

    const removeFile = (index: number) => {
      const updatedFiles = files.filter((_, i) => i !== index);
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
    };

    const openFileDialog = () => {
      inputRef.current?.click();
    };

    return (
      <Box>
        <input
          ref={ref || inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
          {...props}
        />
        
        <Paper
          variant="outlined"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
          sx={{
            p: 3,
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            borderColor: dragActive ? 'primary.main' : (error ? 'error.main' : 'divider'),
            backgroundColor: dragActive ? 'action.hover' : (disabled ? 'action.disabledBackground' : 'background.paper'),
            borderStyle: 'dashed',
            borderWidth: 2,
            opacity: disabled ? 0.6 : 1,
            '&:hover': {
              borderColor: disabled ? 'divider' : 'primary.main',
              backgroundColor: disabled ? 'action.disabledBackground' : 'action.hover',
            },
          }}
        >
          <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag and drop files here, or click to select files
          </Typography>
          {helperText && (
            <Typography variant="caption" color={error ? 'error' : 'text.secondary'} display="block" sx={{ mt: 1 }}>
              {helperText}
            </Typography>
          )}
        </Paper>

        {files.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Files:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {files.map((file, index) => (
                <Chip
                  key={`${file.name}-${index}`}
                  icon={<FileIcon />}
                  label={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                  onDelete={() => removeFile(index)}
                  deleteIcon={<DeleteIcon />}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  }
);

FormFileUpload.displayName = 'FormFileUpload';