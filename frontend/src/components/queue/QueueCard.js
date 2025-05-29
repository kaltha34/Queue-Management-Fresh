import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import AuthContext from '../../context/AuthContext';
import QueueContext from '../../context/QueueContext';

const QueueCard = ({ queue, team, compact = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  const { joinQueue, leaveQueue, getUserQueuePosition } = useContext(QueueContext);
  
  const [joining, setJoining] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);
  
  const waitingCount = queue.members.filter(m => m.status === 'waiting').length;
  const userPosition = isAuthenticated && user ? getUserQueuePosition(queue, user._id) : null;
  const isInQueue = userPosition !== null;
  
  const handleJoinQueue = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setJoining(true);
    await joinQueue(queue._id);
    setJoining(false);
  };
  
  const handleLeaveQueue = async (e) => {
    e.stopPropagation();
    setLeaving(true);
    await leaveQueue(queue._id);
    setLeaving(false);
  };
  
  const handleCardClick = () => {
    navigate(`/team/${team._id}`);
  };
  
  const getStatusColor = (status) => {
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
  
  // Calculate wait time
  const estimatedWaitTime = waitingCount * queue.estimatedTimePerPerson;
  
  // Calculate progress for current user in queue
  const calculateProgress = () => {
    if (!userPosition) return 0;
    const totalWaiting = waitingCount;
    if (totalWaiting === 0) return 100;
    return 100 - ((userPosition.position / totalWaiting) * 100);
  };
  
  return (
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
      onClick={handleCardClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="h3">
            {team.name}
          </Typography>
          <Chip 
            label={queue.status.toUpperCase()} 
            size="small"
            color={getStatusColor(queue.status)}
          />
        </Box>
        
        {!compact && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {team.description.length > 100 
              ? `${team.description.substring(0, 100)}...` 
              : team.description}
          </Typography>
        )}
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PeopleIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2">
            <strong>Waiting:</strong> {waitingCount} people
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTimeIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2">
            <strong>Est. Wait:</strong> ~{estimatedWaitTime} min
          </Typography>
        </Box>
        
        {isInQueue && (
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Your Position:</strong> #{userPosition.position}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={calculateProgress()} 
              color="success"
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        )}
        
        <Box sx={{ mt: 2 }}>
          {isAuthenticated && (
            isInQueue ? (
              <Button 
                variant="outlined" 
                color="error" 
                size="small"
                fullWidth
                onClick={handleLeaveQueue}
                disabled={leaving}
              >
                {leaving ? <CircularProgress size={20} /> : 'Leave Queue'}
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                fullWidth
                onClick={handleJoinQueue}
                disabled={joining || queue.status !== 'active'}
              >
                {joining ? <CircularProgress size={20} /> : 'Join Queue'}
              </Button>
            )
          )}
          
          {!isAuthenticated && (
            <Button 
              variant="contained" 
              color="primary" 
              size="small"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                navigate('/login');
              }}
            >
              Login to Join
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QueueCard;
