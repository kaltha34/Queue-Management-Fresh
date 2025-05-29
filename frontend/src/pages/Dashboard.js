import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Alert,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AddIcon from '@mui/icons-material/Add';
import QueueContext from '../context/QueueContext';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { queues, teams, loading, fetchQueues, fetchTeams, getUserQueuePosition, leaveQueue, createTeam } = useContext(QueueContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [userQueues, setUserQueues] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [openCreateTeamDialog, setOpenCreateTeamDialog] = useState(false);
  const [newTeamData, setNewTeamData] = useState({
    name: '',
    description: '',
    category: 'MERN',
    location: '',
    capacity: 10,
    meetingDays: ['Monday'],
    meetingTime: {
      start: '09:00',
      end: '10:00'
    }
  });
  const [processingAction, setProcessingAction] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchQueues();
    fetchTeams();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (queues.length > 0 && user) {
      // Find queues where the user is a member
      const userActiveQueues = queues.filter(queue => 
        queue.members.some(member => 
          member.user._id === user._id && 
          ['waiting', 'current'].includes(member.status)
        )
      );
      setUserQueues(userActiveQueues);
    }
  }, [queues, user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQueues();
    await fetchTeams();
    setRefreshing(false);
  };

  const handleLeaveQueue = async (queueId) => {
    await leaveQueue(queueId);
  };

  const handleCreateTeamDialogOpen = () => {
    setNewTeamData({
      name: '',
      description: '',
      category: 'MERN',
      location: '',
      capacity: 10,
      meetingDays: ['Monday'],
      meetingTime: {
        start: '09:00',
        end: '10:00'
      }
    });
    setFormErrors({});
    setOpenCreateTeamDialog(true);
  };

  const handleCreateTeamDialogClose = () => {
    setOpenCreateTeamDialog(false);
  };

  const handleTeamInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeamData({
      ...newTeamData,
      [name]: value
    });
  };

  const handleMeetingTimeChange = (e) => {
    const { name, value } = e.target;
    setNewTeamData({
      ...newTeamData,
      meetingTime: {
        ...newTeamData.meetingTime,
        [name]: value
      }
    });
  };

  const handleMeetingDaysChange = (e) => {
    setNewTeamData({
      ...newTeamData,
      meetingDays: e.target.value
    });
  };

  const validateTeamForm = () => {
    const errors = {};
    if (!newTeamData.name.trim()) errors.name = 'Team name is required';
    if (!newTeamData.description.trim()) errors.description = 'Description is required';
    if (!newTeamData.location.trim()) errors.location = 'Location is required';
    if (!newTeamData.meetingTime.start) errors.startTime = 'Start time is required';
    if (!newTeamData.meetingTime.end) errors.endTime = 'End time is required';
    if (newTeamData.meetingDays.length === 0) errors.meetingDays = 'At least one meeting day is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTeam = async () => {
    if (!validateTeamForm()) return;
    
    setProcessingAction(true);
    await createTeam(newTeamData);
    setProcessingAction(false);
    setOpenCreateTeamDialog(false);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'MERN':
        return '#3f51b5';
      case 'AI':
        return '#f44336';
      case 'DevOps':
        return '#4caf50';
      default:
        return '#ff9800';
    }
  };

  if (loading && !refreshing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Box>
            {user && (user.role === 'mentor' || user.role === 'admin') && (
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateTeamDialogOpen}
                sx={{ mr: 2 }}
              >
                Create Team
              </Button>
            )}
            <Button 
              variant="outlined" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? <CircularProgress size={24} /> : 'Refresh'}
            </Button>
          </Box>
        </Box>

        {userQueues.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Your Active Queues
            </Typography>
            <Grid container spacing={3}>
              {userQueues.map(queue => {
                const position = getUserQueuePosition(queue, user._id);
                const team = teams.find(t => t._id === queue.team._id);
                
                return (
                  <Grid item xs={12} md={6} key={queue._id}>
                    <Card 
                      sx={{ 
                        position: 'relative',
                        overflow: 'visible',
                        boxShadow: 3
                      }}
                    >
                      {position && position.position === 1 && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          You're next in line!
                        </Alert>
                      )}
                      
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" component="h3">
                            {team?.name || 'Team'}
                          </Typography>
                          {team && (
                            <Chip 
                              label={team.category} 
                              size="small" 
                              sx={{ 
                                backgroundColor: getCategoryColor(team.category),
                                color: 'white'
                              }} 
                            />
                          )}
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PeopleIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body1">
                            <strong>Your Position:</strong> {position ? `#${position.position}` : 'Loading...'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body1">
                            <strong>Estimated Wait:</strong> {position ? `~${position.estimatedWaitTime} minutes` : 'Calculating...'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MeetingRoomIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body1">
                            <strong>Location:</strong> {team?.location || 'TBD'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            onClick={() => handleLeaveQueue(queue._id)}
                          >
                            Leave Queue
                          </Button>
                          <Button 
                            variant="contained" 
                            onClick={() => navigate(`/team/${team?._id}`)}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        <Paper sx={{ width: '100%', mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="All Teams" />
            <Tab label="Active Queues" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Available Teams
                </Typography>
                {teams.length === 0 ? (
                  <Alert severity="info">No teams available at the moment.</Alert>
                ) : (
                  <Grid container spacing={3}>
                    {teams.map(team => {
                      const activeQueue = queues.find(q => 
                        q.team._id === team._id && 
                        q.status === 'active'
                      );
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} key={team._id}>
                          <Card 
                            sx={{ 
                              height: '100%', 
                              display: 'flex', 
                              flexDirection: 'column',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                boxShadow: 3
                              }
                            }}
                            onClick={() => navigate(`/team/${team._id}`)}
                          >
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" component="h3">
                                  {team.name}
                                </Typography>
                                <Chip 
                                  label={team.category} 
                                  size="small" 
                                  sx={{ 
                                    backgroundColor: getCategoryColor(team.category),
                                    color: 'white'
                                  }} 
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {team.description.length > 100 
                                  ? `${team.description.substring(0, 100)}...` 
                                  : team.description}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Mentor:</strong> {team.mentor.name}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Location:</strong> {team.location}
                              </Typography>
                              
                              {activeQueue && (
                                <Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                                  <Typography variant="body2" color="primary">
                                    <strong>Queue Status:</strong> {activeQueue.members.filter(m => m.status === 'waiting').length} waiting
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </>
            )}
            
            {tabValue === 1 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Active Queues
                </Typography>
                {queues.filter(q => q.status === 'active').length === 0 ? (
                  <Alert severity="info">No active queues at the moment.</Alert>
                ) : (
                  <Grid container spacing={3}>
                    {queues
                      .filter(q => q.status === 'active')
                      .map(queue => {
                        const team = teams.find(t => t._id === queue.team._id);
                        const waitingCount = queue.members.filter(m => m.status === 'waiting').length;
                        
                        return (
                          <Grid item xs={12} sm={6} key={queue._id}>
                            <Card 
                              sx={{ 
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                  transform: 'scale(1.02)',
                                  boxShadow: 3
                                }
                              }}
                              onClick={() => navigate(`/team/${team?._id}`)}
                            >
                              <CardContent>
                                <Typography variant="h6" component="h3">
                                  {team?.name || 'Team Queue'}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2">
                                    <strong>Waiting:</strong> {waitingCount} people
                                  </Typography>
                                  <Typography variant="body2">
                                    <strong>Est. Wait:</strong> ~{waitingCount * queue.estimatedTimePerPerson} min
                                  </Typography>
                                </Box>
                                <Typography variant="body2">
                                  <strong>Location:</strong> {team?.location || 'TBD'}
                                </Typography>
                                
                                {userQueues.some(uq => uq._id === queue._id) ? (
                                  <Button 
                                    variant="outlined" 
                                    color="secondary" 
                                    fullWidth 
                                    sx={{ mt: 2 }}
                                    disabled
                                  >
                                    You're in this queue
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="contained" 
                                    color="primary" 
                                    fullWidth 
                                    sx={{ mt: 2 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/team/${team?._id}`);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                  </Grid>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Box>
      {/* Create Team Dialog */}
      <Dialog open={openCreateTeamDialog} onClose={handleCreateTeamDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Create New Team</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Create a new team that you will mentor. Students will be able to join queues for this team.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Team Name"
                name="name"
                value={newTeamData.name}
                onChange={handleTeamInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={newTeamData.category}
                  label="Category"
                  onChange={handleTeamInputChange}
                >
                  <MenuItem value="MERN">MERN</MenuItem>
                  <MenuItem value="AI">AI</MenuItem>
                  <MenuItem value="DevOps">DevOps</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="description"
                label="Description"
                name="description"
                multiline
                rows={3}
                value={newTeamData.description}
                onChange={handleTeamInputChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="location"
                label="Location"
                name="location"
                value={newTeamData.location}
                onChange={handleTeamInputChange}
                error={!!formErrors.location}
                helperText={formErrors.location}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                id="capacity"
                label="Capacity"
                name="capacity"
                type="number"
                value={newTeamData.capacity}
                onChange={handleTeamInputChange}
                InputProps={{ inputProps: { min: 1, max: 50 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" required error={!!formErrors.meetingDays}>
                <InputLabel id="meeting-days-label">Meeting Days</InputLabel>
                <Select
                  labelId="meeting-days-label"
                  id="meetingDays"
                  multiple
                  value={newTeamData.meetingDays}
                  label="Meeting Days"
                  onChange={handleMeetingDaysChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <MenuItem key={day} value={day}>{day}</MenuItem>
                  ))}
                </Select>
                {formErrors.meetingDays && <FormHelperText>{formErrors.meetingDays}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="start"
                label="Start Time"
                name="start"
                type="time"
                value={newTeamData.meetingTime.start}
                onChange={handleMeetingTimeChange}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.startTime}
                helperText={formErrors.startTime}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="end"
                label="End Time"
                name="end"
                type="time"
                value={newTeamData.meetingTime.end}
                onChange={handleMeetingTimeChange}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.endTime}
                helperText={formErrors.endTime}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateTeamDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCreateTeam} 
            variant="contained" 
            disabled={processingAction}
          >
            {processingAction ? <CircularProgress size={24} /> : 'Create Team'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
