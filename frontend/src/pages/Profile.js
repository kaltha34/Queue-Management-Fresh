import React, { useContext, useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, token, logout } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    if (user) {
      setFormData(prevState => ({
        ...prevState,
        name: user.name,
        email: user.email
      }));
      setInitialLoading(false);
    }
  }, [user]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Only validate password fields if the user is trying to change password
    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password';
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        // Prepare data for API
        const updateData = {
          name: formData.name,
          email: formData.email
        };
        
        // Only include password fields if the user is trying to change password
        if (formData.currentPassword && formData.newPassword) {
          updateData.currentPassword = formData.currentPassword;
          updateData.newPassword = formData.newPassword;
        }
        
        // Make API call to update profile
        const res = await axios.put('/api/auth/user', updateData, {
          headers: {
            'x-auth-token': token
          }
        });
        
        setSuccess(true);
        setMessage('Profile updated successfully');
        
        // Clear password fields
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (err) {
        setSuccess(false);
        setMessage(err.response?.data.message || 'Failed to update profile');
        
        // Set specific field errors if returned from API
        if (err.response?.data.errors) {
          setErrors(err.response.data.errors);
        }
      }
      
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSuccess(false);
    setMessage('');
  };
  
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (initialLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading profile...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar sx={{ width: 100, height: 100, mb: 2 }}>
                <PersonIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              <Typography variant="body2" sx={{ textTransform: 'capitalize', mt: 1 }}>
                Role: {user.role}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Member since: {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Edit Profile
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
                
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Change Password
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <TextField
                  margin="normal"
                  fullWidth
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  id="currentPassword"
                  autoComplete="current-password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type="password"
                  id="newPassword"
                  autoComplete="new-password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                />
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={success ? 'success' : 'error'} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
