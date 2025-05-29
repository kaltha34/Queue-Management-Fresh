import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const MentorRoute = ({ children }) => {
  const { isAuthenticated, loading, isTokenExpired, isMentorOrAdmin } = useContext(AuthContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || isTokenExpired()) {
    return <Navigate to="/login" />;
  }

  if (!isMentorOrAdmin()) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default MentorRoute;
