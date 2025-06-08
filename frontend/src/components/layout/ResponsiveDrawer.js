import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QueueIcon from '@mui/icons-material/Queue';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { useAuth } from '../../context/AuthContext';

const ResponsiveDrawer = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleDrawer = (isOpen) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(isOpen);
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    ...(isAuthenticated 
      ? [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
          { text: 'Queue Management', icon: <QueueIcon />, path: '/queue-management' },
          { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
          { text: 'Logout', icon: <LogoutIcon />, onClick: handleLogout }
        ] 
      : [
          { text: 'Login', icon: <LoginIcon />, path: '/login' },
          { text: 'Register', icon: <HowToRegIcon />, path: '/register' }
        ]
    )
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
      {isAuthenticated && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 40, mb: 1 }} />
          <Box>Hello, {user?.name || 'User'}</Box>
          <Box sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{user?.email}</Box>
        </Box>
      )}
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={item.path ? RouterLink : 'button'} 
            to={item.path} 
            onClick={item.onClick}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleDrawer(true)}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default ResponsiveDrawer;
