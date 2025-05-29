import React, { useContext, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import QueueContext from '../context/QueueContext';
import AuthContext from '../context/AuthContext';

const Home = () => {
  const { teams, queues, loading, fetchTeams, fetchQueues } = useContext(QueueContext);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    fetchTeams();
    fetchQueues();
    // eslint-disable-next-line
  }, []);

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

  const getActiveQueueForTeam = (teamId) => {
    return queues.find(queue => 
      queue.team._id === teamId && 
      queue.status === 'active'
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Queue Management System
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom align="center" color="textSecondary">
          Efficiently manage waiting queues for team meetings
        </Typography>
        
        {!isAuthenticated && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 6 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              component={RouterLink} 
              to="/register"
              sx={{ mr: 2 }}
            >
              Sign Up
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large" 
              component={RouterLink} 
              to="/login"
            >
              Login
            </Button>
          </Box>
        )}

        <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 6, mb: 3 }}>
          Available Teams
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {teams.map(team => {
              const activeQueue = getActiveQueueForTeam(team._id);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={team._id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" component="h2">
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
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {team.description}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2">
                        <strong>Mentor:</strong> {team.mentor.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Location:</strong> {team.location}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Meeting Days:</strong> {team.meetingDays.join(', ')}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Meeting Time:</strong> {team.meetingTime.start} - {team.meetingTime.end}
                      </Typography>
                      
                      {activeQueue && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                          <Typography variant="body2" color="primary">
                            <strong>Active Queue:</strong> {activeQueue.members.filter(m => m.status === 'waiting').length} waiting
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Est. wait: ~{activeQueue.estimatedWaitTime} min
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        color="primary" 
                        component={RouterLink} 
                        to={`/team/${team._id}`}
                      >
                        View Details
                      </Button>
                      {activeQueue && isAuthenticated && (
                        <Button 
                          size="small" 
                          color="secondary" 
                          component={RouterLink} 
                          to={`/team/${team._id}`}
                        >
                          Join Queue
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
        
        {teams.length === 0 && !loading && (
          <Typography variant="body1" align="center" sx={{ my: 4 }}>
            No teams available at the moment.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Home;
