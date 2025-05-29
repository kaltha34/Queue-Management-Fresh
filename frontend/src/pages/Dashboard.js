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
  Chip
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import QueueContext from '../context/QueueContext';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { queues, teams, loading, fetchQueues, fetchTeams, getUserQueuePosition, leaveQueue } = useContext(QueueContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [userQueues, setUserQueues] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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
          <Button 
            variant="outlined" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? <CircularProgress size={24} /> : 'Refresh'}
          </Button>
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
    </Container>
  );
};

export default Dashboard;
