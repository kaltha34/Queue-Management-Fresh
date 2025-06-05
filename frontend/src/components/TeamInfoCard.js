import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  Avatar,
  CardActions,
  Button,
  Divider
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import QueueIcon from '@mui/icons-material/Queue';

const TeamInfoCard = ({ team, showActions = true, showQueueStatus = true }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {team.name}
          </Typography>
          {showQueueStatus && (
            <Chip 
              label={team.hasActiveQueue ? "Queue Active" : "No Active Queue"} 
              color={team.hasActiveQueue ? "success" : "default"}
              size="small"
            />
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {team.description || "No description available"}
        </Typography>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <GroupIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            {team.members?.length || 0} Members
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            Mentor: {team.mentor?.name || "Unassigned"}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">
            Created: {formatDate(team.createdAt)}
          </Typography>
        </Box>
      </CardContent>
      
      {showActions && (
        <>
          <Divider />
          <CardActions>
            <Button 
              size="small" 
              startIcon={<QueueIcon />}
              component={RouterLink} 
              to={`/team/${team._id}`}
            >
              View Details
            </Button>
          </CardActions>
        </>
      )}
    </Card>
  );
};

export default TeamInfoCard;
