import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ 
        my: 8, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <Paper elevation={3} sx={{ p: 5, borderRadius: 2 }}>
          <ErrorOutlineIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h3" component="h1" gutterBottom>
            404 - Page Not Found
          </Typography>
          
          <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
            Oops! The page you're looking for doesn't exist.
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            component={RouterLink} 
            to="/"
          >
            Go to Homepage
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;
