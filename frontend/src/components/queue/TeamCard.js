import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Divider
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import QueueContext from '../../context/QueueContext';

const TeamCard = ({ team, compact = false }) => {
  const navigate = useNavigate();
  const { queues } = useContext(QueueContext);
  
  const activeQueue = queues.find(q => 
    q.team._id === team._id && 
    q.status === 'active'
  );
  
  const handleCardClick = () => {
    navigate(`/team/${team._id}`);
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
            label={team.category} 
            size="small" 
            sx={{ 
              backgroundColor: getCategoryColor(team.category),
              color: 'white'
            }} 
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
          <PersonIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2">
            <strong>Mentor:</strong> {team.mentor.name}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2">
            <strong>Location:</strong> {team.location}
          </Typography>
        </Box>
        
        {!compact && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Meeting Days:</strong> {team.meetingDays.join(', ')}
          </Typography>
        )}
        
        {activeQueue && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="primary">
              <strong>Active Queue:</strong> {activeQueue.members.filter(m => m.status === 'waiting').length} waiting
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Est. wait: ~{activeQueue.members.filter(m => m.status === 'waiting').length * activeQueue.estimatedTimePerPerson} min
            </Typography>
          </Box>
        )}
        
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            size="small"
            fullWidth
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TeamCard;
