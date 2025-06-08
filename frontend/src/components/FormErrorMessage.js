import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * A reusable form error message component
 * @param {string} message - The error message to display
 * @param {boolean} show - Whether to show the error message
 * @param {string} severity - The severity of the error (error, warning, info, success)
 */
const FormErrorMessage = ({ 
  message = '', 
  show = true, 
  severity = 'error'
}) => {
  if (!show || !message) return null;
  
  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Alert 
        severity={severity}
        icon={<ErrorOutlineIcon />}
        sx={{ 
          alignItems: 'center',
          '& .MuiAlert-message': {
            padding: '8px 0'
          }
        }}
      >
        <Typography variant="body2">
          {message}
        </Typography>
      </Alert>
    </Box>
  );
};

export default FormErrorMessage;
