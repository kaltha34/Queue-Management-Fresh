import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * A reusable file upload component
 * @param {function} onFileSelect - Callback when files are selected
 * @param {string} accept - File types to accept (e.g. '.pdf,.doc,.docx')
 * @param {boolean} multiple - Whether to allow multiple file selection
 * @param {number} maxFiles - Maximum number of files allowed
 * @param {number} maxSize - Maximum file size in bytes
 * @param {string} label - Label for the upload button
 */
const FileUpload = ({
  onFileSelect,
  accept = '*',
  multiple = false,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB default
  label = 'Upload File'
}) => {
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const newErrors = [];
    
    // Check number of files
    if (multiple && selectedFiles.length > maxFiles) {
      newErrors.push(`You can only upload up to ${maxFiles} files.`);
      setErrors(newErrors);
      return;
    }
    
    // Check file sizes
    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxSize) {
        newErrors.push(`File "${file.name}" exceeds the maximum size of ${formatBytes(maxSize)}.`);
        return false;
      }
      return true;
    });
    
    setErrors(newErrors);
    
    if (validFiles.length > 0) {
      const newFiles = multiple ? [...files, ...validFiles] : validFiles;
      setFiles(newFiles);
      
      if (onFileSelect) {
        onFileSelect(multiple ? newFiles : newFiles[0]);
      }
      
      // Simulate upload progress
      simulateUpload();
    }
    
    // Reset the file input
    event.target.value = '';
  };
  
  const simulateUpload = () => {
    setUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploading(false), 500);
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };
  
  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    if (onFileSelect) {
      onFileSelect(multiple ? newFiles : newFiles[0] || null);
    }
  };
  
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    // You can add more file type icons based on extensions
    switch (extension) {
      case 'pdf':
        return <InsertDriveFileIcon color="error" />;
      case 'doc':
      case 'docx':
        return <InsertDriveFileIcon color="primary" />;
      case 'xls':
      case 'xlsx':
        return <InsertDriveFileIcon color="success" />;
      default:
        return <InsertDriveFileIcon />;
    }
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
      />
      
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover'
          }
        }}
        onClick={() => fileInputRef.current.click()}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {multiple 
            ? `Drag & drop files here, or click to select files (max ${maxFiles} files, ${formatBytes(maxSize)} each)`
            : `Drag & drop a file here, or click to select a file (max ${formatBytes(maxSize)})`
          }
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<CloudUploadIcon />}
          sx={{ mt: 2 }}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current.click();
          }}
        >
          Select File{multiple ? 's' : ''}
        </Button>
      </Paper>
      
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
            Uploading... {uploadProgress}%
          </Typography>
        </Box>
      )}
      
      {errors.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {errors.map((error, index) => (
            <Typography key={index} color="error" variant="body2">
              {error}
            </Typography>
          ))}
        </Box>
      )}
      
      {files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map((file, index) => (
            <ListItem key={index} divider={index < files.length - 1}>
              {getFileIcon(file.name)}
              <ListItemText 
                primary={file.name} 
                secondary={formatBytes(file.size)}
                sx={{ ml: 2 }}
              />
              {!uploading && (
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
              {uploadProgress === 100 && (
                <CheckCircleIcon color="success" sx={{ ml: 1 }} />
              )}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FileUpload;
