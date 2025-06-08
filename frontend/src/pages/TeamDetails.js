import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Alert,
  AlertTitle,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip
} from '@mui/material';
import { toast } from 'react-toastify';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import QueueContext from '../context/QueueContext';
import AuthContext from '../context/AuthContext';

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { teams, queues, loading, fetchTeams, fetchQueues, joinQueue, leaveQueue, getUserQueuePosition, createQueue } = useContext(QueueContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [team, setTeam] = useState(null);
  const [activeQueue, setActiveQueue] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [projectInterest, setProjectInterest] = useState('');
  const [creatingQueue, setCreatingQueue] = useState(false);

  useEffect(() => {
    fetchTeams();
    fetchQueues();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (teams.length > 0) {
      const foundTeam = teams.find(t => t._id === id);
      setTeam(foundTeam);
    }
  }, [teams, id]);

  useEffect(() => {
    if (queues.length > 0 && team) {
      const foundQueue = queues.find(q => 
        q.team._id === team._id && 
        q.status === 'active'
      );
      setActiveQueue(foundQueue);
    }
  }, [queues, team]);

  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (activeQueue && user) {
      const position = getUserQueuePosition(activeQueue, user._id);
      setUserPosition(position);
      
      const userInQueue = activeQueue.members.some(member => 
        member.user._id === user._id && 
        ['waiting', 'current'].includes(member.status)
      );
      setIsInQueue(userInQueue);

      // Check if user has a pending request
      const hasPendingRequest = activeQueue.members.some(member => 
        member.user._id === user._id && 
        member.status === 'pending'
      );
      setIsPending(hasPendingRequest);
    } else {
      setUserPosition(null);
      setIsInQueue(false);
      setIsPending(false);
    }
  }, [activeQueue, user, getUserQueuePosition]);

  const handleJoinQueueClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setOpenJoinDialog(true);
  };

  const handleJoinDialogClose = () => {
    setOpenJoinDialog(false);
  };

  const handleJoinQueue = async () => {
    setJoining(true);
    await joinQueue(activeQueue._id, projectInterest);
    setJoining(false);
    setOpenJoinDialog(false);
    setProjectInterest('');
    // After joining, the status will be pending until approved
    setIsPending(true);
  };

  const handleLeaveQueue = async () => {
    setLeaving(true);
    await leaveQueue(activeQueue._id);
    setLeaving(false);
  };

  const handleCreateQueue = async () => {
    if (!team) return;
    
    setCreatingQueue(true);
    const queueData = {
      teamId: team._id,
      date: new Date(),
      estimatedTimePerPerson: 15
    };
    
    try {
      await createQueue(queueData);
      toast.success('Queue created successfully!');
      // Refresh queues to show the newly created queue
      await fetchQueues();
    } catch (err) {
      console.error('Error creating queue:', err);
      toast.error('Failed to create queue');
    } finally {
      setCreatingQueue(false);
    }
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!team) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            Team not found. <Button color="inherit" onClick={() => navigate('/')}>Go back to home</Button>
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
            Back
          </Button>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {team.name}
                  </Typography>
                  <Chip 
                    label={team.category} 
                    size="medium" 
                    sx={{ 
                      backgroundColor: getCategoryColor(team.category),
                      color: 'white',
                      fontWeight: 'bold'
                    }} 
                  />
                </Box>
                
                <Typography variant="body1" paragraph>
                  {team.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        <strong>Mentor:</strong> {team.mentor.name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MeetingRoomIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        <strong>Location:</strong> {team.location}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Meeting Days:</strong> {team.meetingDays.join(', ')}
                    </Typography>
                    
                    <Typography variant="body1">
                      <strong>Meeting Time:</strong> {team.meetingTime.start} - {team.meetingTime.end}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Queue Status
                  </Typography>
                  
                  {activeQueue ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PeopleIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          <strong>Waiting:</strong> {activeQueue.members.filter(m => m.status === 'waiting').length} people
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          <strong>Est. Wait Time:</strong> ~{activeQueue.estimatedTimePerPerson * activeQueue.members.filter(m => m.status === 'waiting').length} min
                        </Typography>
                      </Box>
                      
                      {isInQueue ? (
                        <>
                          <Alert severity="success" sx={{ mb: 2 }}>
                            <AlertTitle>You're in the Queue!</AlertTitle>
                            {userPosition !== null && (
                              <Typography variant="body2">
                                Your position: #{userPosition.position}
                                {userPosition.estimatedWaitTime && ` (Est. wait: ~${userPosition.estimatedWaitTime} minutes)`}
                              </Typography>
                            )}
                          </Alert>
                          
                          <Button 
                            variant="outlined" 
                            color="error" 
                            fullWidth 
                            onClick={handleLeaveQueue}
                            disabled={leaving}
                          >
                            {leaving ? <CircularProgress size={24} /> : 'Leave Queue'}
                          </Button>
                        </>
                      ) : isPending ? (
                        <>
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            <AlertTitle>Request Pending</AlertTitle>
                            Your request to join this queue is waiting for approval from the team mentor.
                          </Alert>
                          
                          <Button 
                            variant="outlined" 
                            color="error" 
                            fullWidth 
                            onClick={handleLeaveQueue}
                            disabled={leaving}
                          >
                            {leaving ? <CircularProgress size={24} /> : 'Cancel Request'}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={handleJoinQueueClick}
                          disabled={joining}
                        >
                          {joining ? <CircularProgress size={24} /> : 'Join Queue'}
                        </Button>
                      )}
                    
                    
                    {!isAuthenticated && (
                      <Button
                        variant="contained" 
                        color="primary" 
                        onClick={handleJoinQueueClick}
                        disabled={isInQueue || isPending || !activeQueue || joining}
                        fullWidth
                      >
                        {joining ? (
                          <>
                            <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                            Joining...
                          </>
                        ) : isPending ? 'Request Pending' : 'Join Queue'}
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      No active queue for this team at the moment.
                    </Alert>
                    
                    {user && (user.role === 'admin' || (team && team.mentor._id === user._id)) && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateQueue}
                        disabled={creatingQueue || (user && user.role !== 'admin' && team.mentor._id !== user._id)}
                        startIcon={creatingQueue ? <CircularProgress size={20} /> : <MeetingRoomIcon />}
                        fullWidth
                      >
                        {creatingQueue ? 'Creating...' : 'Create Queue Now'}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            </Grid>
          </Grid>
        </Box>
        
        {activeQueue && (activeQueue.members.filter(m => m.status === 'waiting').length > 0 || activeQueue.members.filter(m => m.status === 'pending').length > 0) && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Current Queue
            </Typography>
            
            {activeQueue.members.filter(m => m.status === 'pending').length > 0 && (
              <>
                <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2, color: 'text.secondary' }}>
                  Pending Requests
                </Typography>
                <Paper elevation={2} sx={{ mb: 3, bgcolor: '#fff9c4' }}>
                  <List>
                    {activeQueue.members
                      .filter(m => m.status === 'pending')
                      .sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt))
                      .map((member, index) => (
                        <React.Fragment key={member._id}>
                          {index > 0 && <Divider variant="inset" component="li" />}
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar>
                                <PersonIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={
                                <Typography variant="body1">
                                  {member.user.name} {member.user._id === user?._id && <Chip size="small" label="You" color="primary" />}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" component="span" color="text.secondary">
                                    Requested at {new Date(member.joinedAt).toLocaleTimeString()}
                                  </Typography>
                                  <br />
                                  <Typography variant="body2" component="span" color="text.secondary">
                                    Project: {member.notes || 'Not specified'}
                                  </Typography>
                                  <br />
                                  <Chip size="small" label="Pending Approval" color="warning" sx={{ mt: 0.5 }} />
                                </>
                              }
                            />
                          </ListItem>
                        </React.Fragment>
                      ))}
                  </List>
                </Paper>
              </>
            )}
            
            {activeQueue.members.filter(m => m.status === 'waiting').length > 0 && (
              <>
                <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2, color: 'text.secondary' }}>
                  Waiting Students
                </Typography>
                <Paper elevation={2}>
                  <List>
                    {activeQueue.members
                      .filter(m => m.status === 'waiting')
                      .sort((a, b) => a.queueNumber - b.queueNumber)
                      .map((member, index) => (
                        <React.Fragment key={member._id}>
                          {index > 0 && <Divider variant="inset" component="li" />}
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar>
                                <PersonIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={
                                <Typography variant="body1">
                                  #{member.queueNumber} - {member.user.name} {member.user._id === user?._id && <Chip size="small" label="You" color="primary" />}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" component="span" color="text.secondary">
                                    Joined at {new Date(member.joinedAt).toLocaleTimeString()}
                                  </Typography>
                                  <br />
                                  <Typography variant="body2" component="span" color="text.secondary">
                                    Est. wait: ~{activeQueue.estimatedTimePerPerson * (member.queueNumber - (activeQueue.currentNumber || 0))} min
                                  </Typography>
                                </>
                              }
                            />
                            {index === 0 && (
                              <Chip label="Next Up" color="success" />
                            )}
                          </ListItem>
                        </React.Fragment>
                      ))}
                  </List>
                </Paper>
              </>
            )}
          </Box>
        )}
      </Box>
      {/* Join Queue Dialog */}
      <Dialog open={openJoinDialog} onClose={handleJoinDialogClose}>
        <DialogTitle>Join Queue</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please specify which project you're interested in discussing with the mentor.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="projectInterest"
            label="Project Interest"
            type="text"
            fullWidth
            variant="outlined"
            value={projectInterest}
            onChange={(e) => setProjectInterest(e.target.value)}
            placeholder="e.g., MERN Stack Project, AI Model Training, DevOps Pipeline"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleJoinDialogClose}>Cancel</Button>
          <Button 
            onClick={handleJoinQueue} 
            variant="contained" 
            disabled={joining}
          >
            {joining ? <CircularProgress size={24} /> : 'Join Queue'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeamDetails;
