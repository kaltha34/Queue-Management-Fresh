import React, { useContext, useEffect, useState } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Alert,
  AlertTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Chip
} from '@mui/material';
import { toast } from 'react-toastify';
// Date picker components removed due to compatibility issues
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import QueueContext from '../context/QueueContext';
import AuthContext from '../context/AuthContext';
import QueueStatistics from '../components/QueueStatistics';
import QueueSearch from '../components/QueueSearch';
import ConfirmationDialog from '../components/ConfirmationDialog';
import StudentNotes from '../components/StudentNotes';

const QueueManagement = () => {
  const { teams, queues, loading, fetchTeams, fetchQueues, nextInQueue, createQueue, updateQueueStatus, approveRequest, rejectRequest, updateMemberNotes } = useContext(QueueContext);
  const { user } = useContext(AuthContext);
  
  const [mentorTeams, setMentorTeams] = useState([]);
  const [mentorQueues, setMentorQueues] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newQueueData, setNewQueueData] = useState({
    teamId: '',
    date: new Date(),
    estimatedTimePerPerson: 15
  });
  const [processingAction, setProcessingAction] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    confirmAction: null,
    confirmColor: 'primary'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchTeams();
        await fetchQueues();
        console.log('Teams and queues loaded');
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    // eslint-disable-next-line
  }, []);
  
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchTeams();
      await fetchQueues();
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (teams.length > 0 && user) {
      let userTeams;
      // If user is admin, show all teams, otherwise only show teams where user is the mentor
      if (user.role === 'admin') {
        userTeams = teams;
      } else {
        // Fix: Ensure we're comparing string IDs correctly and handle potential undefined values
        userTeams = teams.filter(team => {
          // Skip teams with missing mentor data
          if (!team.mentor || !team.mentor._id) {
            console.warn('Team missing mentor data:', team);
            return false;
          }
          
          try {
            // Convert IDs to strings for comparison
            const mentorId = team.mentor._id.toString();
            const userId = user._id.toString();
            return mentorId === userId;
          } catch (error) {
            console.error('Error comparing IDs:', error);
            return false;
          }
        });
      }
      
      console.log('User teams found:', userTeams.length);
      setMentorTeams(userTeams);
      
      if (userTeams.length > 0 && !selectedTeam) {
        setSelectedTeam(userTeams[0]);
      }
    }
  }, [teams, user, selectedTeam]);

  useEffect(() => {
    if (queues.length > 0 && selectedTeam) {
      try {
        // Find queues for the selected team - handle potential undefined values
        const teamQueues = queues.filter(queue => {
          // Skip queues with missing team data
          if (!queue.team || !queue.team._id) {
            console.warn('Queue missing team data:', queue);
            return false;
          }
          return queue.team._id === selectedTeam._id;
        });
        setMentorQueues(teamQueues);
      } catch (error) {
        console.error('Error filtering queues:', error);
        setMentorQueues([]);
      }
    } else {
      setMentorQueues([]);
    }
  }, [queues, selectedTeam]);

  const handleTeamChange = (event) => {
    const teamId = event.target.value;
    const team = mentorTeams.find(t => t._id === teamId);
    setSelectedTeam(team);
    setNewQueueData({ ...newQueueData, teamId });
  };

  const handleCreateDialogOpen = () => {
    setNewQueueData({
      teamId: selectedTeam ? selectedTeam._id : '',
      date: new Date(),
      estimatedTimePerPerson: 15
    });
    setOpenCreateDialog(true);
  };

  const handleCreateDialogClose = () => {
    setOpenCreateDialog(false);
  };

  const handleCreateQueue = async () => {
    if (!newQueueData.teamId) {
      toast.error('Please select a team');
      return;
    }

    try {
      setProcessingAction(true);
      const result = await createQueue(newQueueData);
      
      if (result) {
        setOpenCreateDialog(false);
        // Refresh queues to show the newly created queue
        await fetchQueues();
        toast.success('Queue created successfully');
      } else {
        toast.error('Failed to create queue. Please try again.');
      }
    } catch (error) {
      console.error('Error creating queue:', error);
      toast.error(`Failed to create queue: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleNextInQueue = async (queueId) => {
    setConfirmDialog({
      open: true,
      title: 'Next Student',
      message: 'Are you ready to serve the next student in the queue?',
      confirmText: 'Next Student',
      confirmColor: 'primary',
      confirmAction: async () => {
        try {
          setProcessingAction(true);
          const result = await nextInQueue(queueId);
          if (result) {
            toast.success('Next student is now being served');
          } else {
            toast.warning('No more students in the queue');
          }
        } catch (error) {
          console.error('Error serving next student:', error);
          toast.error(`Failed to serve next student: ${error.message || 'Unknown error'}`);
        } finally {
          setProcessingAction(false);
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  const handleApproveRequest = async (queueId, userId) => {
    setConfirmDialog({
      open: true,
      title: 'Approve Request',
      message: 'Are you sure you want to approve this student\'s request to join the queue?',
      confirmText: 'Approve',
      confirmColor: 'success',
      confirmAction: async () => {
        setProcessingAction(true);
        await approveRequest(queueId, userId);
        setProcessingAction(false);
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const handleRejectRequest = async (queueId, userId) => {
    setConfirmDialog({
      open: true,
      title: 'Reject Request',
      message: 'Are you sure you want to reject this student\'s request to join the queue?',
      confirmText: 'Reject',
      confirmColor: 'error',
      confirmAction: async () => {
        setProcessingAction(true);
        await rejectRequest(queueId, userId);
        setProcessingAction(false);
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };
  
  const handleSaveNotes = async (queueId, userId, notes) => {
    setProcessingAction(true);
    try {
      await updateMemberNotes(queueId, userId, notes);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleQueueStatusChange = async (queueId, status) => {
    try {
      setProcessingAction(true);
      const result = await updateQueueStatus(queueId, status);
      if (result) {
        const statusMessages = {
          active: 'Queue is now active',
          paused: 'Queue has been paused',
          closed: 'Queue has been closed'
        };
        toast.success(statusMessages[status] || `Queue status updated to ${status}`);
      } else {
        toast.error(`Failed to update queue status to ${status}`);
      }
    } catch (error) {
      console.error(`Error updating queue status to ${status}:`, error);
      toast.error(`Failed to update queue status: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingAction(false);
    }
  };

  const getQueueStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'closed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && !processingAction) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Debug information
  console.log('Current user:', user);
  console.log('Teams available:', teams.length);
  console.log('Mentor teams:', mentorTeams.length);
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Queue Management
          </Typography>
          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : mentorTeams.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            {user && user.role === 'admin' ? (
              <>There are no teams in the system yet. You can create teams from the Dashboard.</>  
            ) : (
              <>You don't have any teams assigned to you. Please contact an administrator to create a team.</>
            )}
          </Alert>
        ) : (
          <>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel id="team-select-label">Select Team</InputLabel>
                  <Select
                    labelId="team-select-label"
                    id="team-select"
                    value={selectedTeam ? selectedTeam._id : ''}
                    label="Select Team"
                    onChange={handleTeamChange}
                  >
                    {mentorTeams.map(team => (
                      <MenuItem key={team._id} value={team._id}>{team.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleCreateDialogOpen}
                  disabled={!selectedTeam}
                >
                  {mentorTeams.map(team => (
                    <MenuItem key={team._id} value={team._id}>{team.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleCreateDialogOpen}
                disabled={!selectedTeam}
              >
                Create New Queue
              </Button>
            </Box>
            
            {selectedTeam && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedTeam.name} {selectedTeam.category ? `- ${selectedTeam.category}` : ''}
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedTeam.description || 'No description available'}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Location:</strong> {selectedTeam.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Meeting Days:</strong> {selectedTeam.meetingDays && selectedTeam.meetingDays.length > 0 ? selectedTeam.meetingDays.join(', ') : 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Meeting Time:</strong> {selectedTeam.meetingTime && selectedTeam.meetingTime.start && selectedTeam.meetingTime.end ? 
                        `${selectedTeam.meetingTime.start} - ${selectedTeam.meetingTime.end}` : 'Not specified'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Capacity:</strong> {selectedTeam.capacity} students
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
          
          {selectedTeam && (
            <>
              <Typography variant="h5" component="h2" gutterBottom>
                Queues for {selectedTeam.name}
              </Typography>
              
              {mentorQueues.length === 0 ? (
                <Alert severity="info">
                  No queues found for this team. Create a new queue to get started.
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {mentorQueues.map(queue => {
                    const waitingMembers = queue.members.filter(m => m.status === 'waiting');
                    const pendingMembers = queue.members.filter(m => m.status === 'pending');
                    const currentMember = queue.members.find(m => m.status === 'current');
                    return (
                      <Grid item xs={12} key={queue._id}>
                        <Card>
                          <CardContent>
                            {/* Add Queue Statistics */}
                            <QueueStatistics queue={queue} />
                            
                            {/* Add Search Feature */}
                            <QueueSearch onSearch={(term) => setSearchTerm(term)} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6">
                                Queue for {new Date(queue.date).toLocaleDateString()}
                              </Typography>
                              <Chip 
                                label={(queue.status || 'unknown').toUpperCase()} 
                                color={getQueueStatusColor(queue.status)} 
                              />
                            </Box>
                            
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={4}>
                                <Typography variant="body1">
                                  <strong>Created:</strong> {new Date(queue.createdAt).toLocaleString()}
                                </Typography>
                                <Typography variant="body1">
                                  <strong>Est. Time Per Person:</strong> {queue.estimatedTimePerPerson} min
                                </Typography>
                                <Typography variant="body1">
                                  <strong>Location:</strong> {selectedTeam.location || 'Not specified'}
                                </Typography>
                                <Typography variant="body1">
                                  <strong>Pending Requests:</strong> {pendingMembers.length} people
                                </Typography>
                                
                                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                  {queue.status === 'active' ? (
                                    <Button 
                                      variant="outlined" 
                                      color="warning" 
                                      startIcon={<PauseIcon />}
                                      onClick={() => handleQueueStatusChange(queue._id, 'paused')}
                                      disabled={processingAction}
                                    >
                                      Pause
                                    </Button>
                                  ) : queue.status === 'paused' ? (
                                    <Button 
                                      variant="outlined" 
                                      color="success" 
                                      startIcon={<PlayArrowIcon />}
                                      onClick={() => handleQueueStatusChange(queue._id, 'active')}
                                      disabled={processingAction}
                                    >
                                      Resume
                                    </Button>
                                  ) : null}
                                  
                                  {queue.status !== 'closed' && (
                                    <Button 
                                      variant="outlined" 
                                      color="error" 
                                      startIcon={<StopIcon />}
                                      onClick={() => handleQueueStatusChange(queue._id, 'closed')}
                                      disabled={processingAction}
                                    >
                                      Close
                                    </Button>
                                  )}
                                </Box>
                              </Grid>
                              
                              <Grid item xs={12} md={8}>
                                {currentMember && (
                                  <Box sx={{ mb: 2 }}>
                                    <Alert severity="success">
                                      <AlertTitle>Current Student</AlertTitle>
                                      <Typography variant="body1">
                                        <strong>{currentMember.user.name}</strong> (Queue #{currentMember.queueNumber})
                                      </Typography>
                                    </Alert>
                                    {queue.status === 'active' ? (
                                      <Button 
                                        variant="outlined" 
                                        color="warning" 
                                        startIcon={<PauseIcon />}
                                        onClick={() => handleQueueStatusChange(queue._id, 'paused')}
                                        disabled={processingAction}
                                      >
                                        Pause
                                      </Button>
                                    ) : queue.status === 'paused' ? (
                                      <Button 
                                        variant="outlined" 
                                        color="success" 
                                        startIcon={<PlayArrowIcon />}
                                        onClick={() => handleQueueStatusChange(queue._id, 'active')}
                                        disabled={processingAction}
                                      >
                                        Resume
                                      </Button>
                                    ) : null}
                                    
                                    {queue.status !== 'closed' && (
                                      <Button 
                                        variant="outlined" 
                                        color="error" 
                                        startIcon={<StopIcon />}
                                        onClick={() => handleQueueStatusChange(queue._id, 'closed')}
                                        disabled={processingAction}
                                      >
                                        Close
                                      </Button>
                                    )}
                                  </Box>
                                </Grid>
                                
                                <Grid item xs={12} md={8}>
                                  {currentMember && (
                                    <Box sx={{ mb: 2 }}>
                                      <Alert severity="success">
                                        <AlertTitle>Current Student</AlertTitle>
                                        <Typography variant="body1">
                                          <strong>{currentMember.user.name}</strong> (Queue #{currentMember.queueNumber})
                                        </Typography>
                                      </Alert>
                                    </Box>
                                  )}
                                  
                                  {/* Queue Members Section - Both Pending and Waiting */}
                                  <Box sx={{ mt: 2, mb: 3 }}>
                                    {/* Pending Requests Section */}
                                    {pendingMembers.length > 0 && (
                                      <Box sx={{ mb: 4 }}>
                                        <Typography variant="h6" gutterBottom sx={{ color: 'warning.main', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                          <Chip label={pendingMembers.length} color="warning" size="small" sx={{ mr: 1, fontWeight: 'bold' }} />
                                          Pending Requests
                                        </Typography>
                                        <Paper elevation={2} sx={{ bgcolor: '#fff9c4', border: '1px solid #ffc107' }}>
                                          <List>
                                            {pendingMembers.map((member, index) => (
                                              <React.Fragment key={member._id}>
                                                {index > 0 && <Divider component="li" />}
                                                <ListItem
                                                  alignItems="flex-start"
                                                  sx={{ py: 2 }}
                                                >
                                                  <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                                                      <PersonIcon />
                                                    </Avatar>
                                                  </ListItemAvatar>
                                                  <ListItemText
                                                    primary={
                                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                                                          {member.user.name}
                                                        </Typography>
                                                        <Chip size="small" label="Pending" color="warning" sx={{ ml: 1 }} />
                                                      </Box>
                                                    }
                                                    secondary={
                                                      <>
                                                        <Box sx={{ mt: 1, mb: 2 }}>
                                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                            <Typography variant="body2" component="div" sx={{ color: 'text.secondary' }}>
                                                              <strong>Email:</strong> {member.user.email}
                                                            </Typography>
                                                            <StudentNotes 
                                                              studentId={member.user._id}
                                                              studentName={member.user.name}
                                                              initialNotes={member.mentorNotes || ''}
                                                              onSave={(userId, notes) => handleSaveNotes(queue._id, userId, notes)}
                                                            />
                                                          </Box>
                                                          <Typography variant="body1" component="div" sx={{ mb: 1 }}>
                                                            <strong>Project Interest:</strong>
                                                          </Typography>
                                                          <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
                                                            {member.notes || 'Not specified'}
                                                          </Paper>
                                                        </Box>
                                                        <Typography component="span" variant="body2" color="text.secondary">
                                                          Requested at {new Date(member.joinedAt).toLocaleTimeString()} on {new Date(member.joinedAt).toLocaleDateString()}
                                                        </Typography>
                                                      </>
                                                    }
                                                  />
                                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2, minWidth: 120 }}>
                                                    <Button 
                                                      color="success" 
                                                      variant="contained" 
                                                      fullWidth
                                                      onClick={() => handleApproveRequest(queue._id, member.user._id)}
                                                      disabled={processingAction}
                                                      sx={{ fontWeight: 'bold' }}
                                                    >
                                                      Approve
                                                    </Button>
                                                    <Button 
                                                      color="error" 
                                                      variant="outlined" 
                                                      fullWidth
                                                      onClick={() => handleRejectRequest(queue._id, member.user._id)}
                                                      disabled={processingAction}
                                                    >
                                                      Reject
                                                    </Button>
                                                  </Box>
                                                </ListItem>
                                              </React.Fragment>
                                            ))}
                                          </List>
                                        </Paper>
                                      </Box>
                                    )}
                                    
                                    {/* Waiting Students Section */}
                                    {waitingMembers.length > 0 && (
                                      <Box>
                                        <Typography variant="h6" gutterBottom sx={{ color: 'success.main', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                          <Chip label={waitingMembers.length} color="success" size="small" sx={{ mr: 1, fontWeight: 'bold' }} />
                                          Accepted Students in Queue
                                        </Typography>
                                        <Paper elevation={2} sx={{ bgcolor: '#e8f5e9', border: '1px solid #4caf50' }}>
                                          <List>
                                            {waitingMembers
                                              .filter(member => 
                                                !searchTerm || 
                                                member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                (member.notes && member.notes.toLowerCase().includes(searchTerm.toLowerCase()))
                                              )
                                              .sort((a, b) => a.queueNumber - b.queueNumber)
                                              .map((member, index) => (
                                                <React.Fragment key={member._id}>
                                                  {index > 0 && <Divider component="li" />}
                                                  <ListItem
                                                    alignItems="flex-start"
                                                    sx={{ py: 2 }}
                                                  >
                                                    <ListItemAvatar>
                                                      <Avatar sx={{ bgcolor: index === 0 ? 'success.main' : 'primary.main' }}>
                                                        {index === 0 ? <PlayArrowIcon /> : <PersonIcon />}
                                                      </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                      primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                          <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                                                            #{member.queueNumber} - {member.user.name}
                                                          </Typography>
                                                          {index === 0 && <Chip size="small" label="Next Up" color="success" sx={{ ml: 1 }} />}
                                                        </Box>
                                                      }
                                                      secondary={
                                                        <>
                                                          <Box sx={{ mt: 1, mb: 2 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                              <Typography variant="body2" component="div" sx={{ color: 'text.secondary' }}>
                                                                <strong>Email:</strong> {member.user.email}
                                                              </Typography>
                                                              <StudentNotes 
                                                                studentId={member.user._id}
                                                                studentName={member.user.name}
                                                                initialNotes={member.mentorNotes || ''}
                                                                onSave={(userId, notes) => handleSaveNotes(queue._id, userId, notes)}
                                                              />
                                                            </Box>
                                                            <Typography variant="body1" component="div" sx={{ mb: 1 }}>
                                                              <strong>Project Interest:</strong>
                                                            </Typography>
                                                            <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
                                                              {member.notes || 'Not specified'}
                                                            </Paper>
                                                          </Box>
                                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography component="span" variant="body2" color="text.secondary">
                                                              Joined at {new Date(member.joinedAt).toLocaleTimeString()} on {new Date(member.joinedAt).toLocaleDateString()}
                                                            </Typography>
                                                            <Typography component="span" variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                              Est. wait: ~{queue.estimatedTimePerPerson * (member.queueNumber - (queue.currentNumber || 0))} min
                                                            </Typography>
                                                          </Box>
                                                        </>
                                                      }
                                                    />
                                                    {index === 0 && (
                                                      <Box sx={{ ml: 2 }}>
                                                        <Button
                                                          variant="contained"
                                                          color="primary"
                                                          onClick={() => handleNextInQueue(queue._id)}
                                                          disabled={processingAction || queue.status !== 'active'}
                                                        >
                                                          Start Session
                                                        </Button>
                                                      </Box>
                                                    )}
                                                  </ListItem>
                                                </React.Fragment>
                                              ))}
                                          </List>
                                        </Paper>
                                      </Box>
                                    )}
                                    
                                    {pendingMembers.length === 0 && waitingMembers.length === 0 && (
                                      <Alert severity="info" sx={{ mt: 2 }}>
                                        No students in the queue yet.
                                      </Alert>
                                    )}
                                  </Box>
                                  
                                  {/* Waiting Students Section */}
                                  {waitingMembers.length > 0 ? (
                                    <Box>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="subtitle1">
                                          Waiting List
                                        </Typography>
                                        <Button 
                                          variant="contained" 
                                          color="primary"
                                          onClick={() => handleNextInQueue(queue._id)}
                                          disabled={processingAction || queue.status !== 'active'}
                                        >
                                          Next Student
                                        </Button>
                                      </Box>
                                      <Paper variant="outlined">
                                        <List dense>
                                          {waitingMembers
                                            .filter(member => 
                                              !searchTerm || 
                                              member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                              (member.notes && member.notes.toLowerCase().includes(searchTerm.toLowerCase()))
                                            )
                                            .sort((a, b) => a.queueNumber - b.queueNumber)
                                            .slice(0, 5)
                                            .map((member, index) => (
                                              <React.Fragment key={member._id}>
                                                {index > 0 && <Divider component="li" />}
                                                <ListItem
                                                  secondaryAction={
                                                    <IconButton edge="end" aria-label="delete">
                                                      <DeleteIcon />
                                                    </IconButton>
                                                  }
                                                >
                                                  <ListItemAvatar>
                                                    <Avatar>
                                                      <PersonIcon />
                                                    </Avatar>
                                                  </ListItemAvatar>
                                                  <ListItemText
                                                    primary={`#${member.queueNumber} - ${member.user.name}`}
                                                    secondary={
                                                      <>
                                                        <Typography component="span" variant="body2">
                                                          Project: {member.notes || 'Not specified'}
                                                        </Typography>
                                                        <br />
                                                        <Typography component="span" variant="body2" color="text.secondary">
                                                          Joined at {new Date(member.joinedAt).toLocaleTimeString()}
                                                        </Typography>
                                                      </>
                                                    }
                                                  />
                                                </ListItem>
                                              </React.Fragment>
                                            ))}
                                          
                                          {waitingMembers.length > 5 && (
                                            <ListItem>
                                              <ListItemText
                                                primary={`+ ${waitingMembers.length - 5} more students waiting`}
                                                sx={{ textAlign: 'center' }}
                                              />
                                            </ListItem>
                                          )}
                                        </List>
                                      </Paper>
                                    </Box>
                                  ) : (
                                    <Alert severity="info" sx={{ mt: pendingMembers.length > 0 ? 2 : 0 }}>
                                      No students waiting in this queue.
                                    </Alert>
                                  )}
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </>
            )}
          </>
        )}
      </Box>
      
      {/* Create Queue Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCreateDialogClose}>
        <DialogTitle>Create New Queue</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Create a new queue for students to join. This will allow students to line up for meetings with your team.
          </DialogContentText>
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="create-team-select-label">Team</InputLabel>
            <Select
              labelId="create-team-select-label"
              id="create-team-select"
              value={newQueueData.teamId}
              label="Team"
              onChange={(e) => setNewQueueData({ ...newQueueData, teamId: e.target.value })}
              error={!newQueueData.teamId}
            >
              {mentorTeams.map(team => (
                <MenuItem key={team._id} value={team._id}>{team.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Simple text field instead of TimePicker due to compatibility issues */}
          <TextField
            margin="normal"
            id="estimatedTimePerPerson"
            label="Estimated Time Per Person (minutes)"
            type="number"
            fullWidth
            value={newQueueData.estimatedTimePerPerson}
            onChange={(e) => setNewQueueData({ ...newQueueData, estimatedTimePerPerson: parseInt(e.target.value) || 15 })}
            InputProps={{ inputProps: { min: 1, max: 60 } }}
            helperText="Approximate time you'll spend with each student"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCreateQueue} 
            variant="contained"
            color="primary"
            disabled={!newQueueData.teamId || processingAction}
          >
            {processingAction ? <CircularProgress size={24} /> : 'Create Queue'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText || 'Confirm'}
        confirmColor={confirmDialog.confirmColor || 'primary'}
        onConfirm={() => confirmDialog.confirmAction && confirmDialog.confirmAction()}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />
    </Container>
  );
};

export default QueueManagement;
