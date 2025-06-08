import React from 'react';
import { 
  Breadcrumbs as MuiBreadcrumbs, 
  Link, 
  Typography,
  Box
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Map of route paths to display names
  const routeNameMap = {
    'dashboard': 'Dashboard',
    'profile': 'Profile',
    'queue-management': 'Queue Management',
    'team': 'Team Details',
    'login': 'Login',
    'register': 'Register',
  };

  return (
    <Box sx={{ mb: 3, mt: 1 }}>
      <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // Handle team ID paths
          if (value.match(/^[0-9a-fA-F]{24}$/)) {
            return last ? (
              <Typography color="text.primary" key={to}>
                Team
              </Typography>
            ) : (
              <Link component={RouterLink} to={to} key={to} color="inherit">
                Team
              </Link>
            );
          }
          
          // Use the route name map or capitalize the first letter
          const name = routeNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);
          
          return last ? (
            <Typography color="text.primary" key={to}>
              {name}
            </Typography>
          ) : (
            <Link component={RouterLink} to={to} key={to} color="inherit">
              {name}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
