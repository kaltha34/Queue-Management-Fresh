import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Divider,
  Tooltip
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const QueueStatistics = ({ queue }) => {
  if (!queue) return null;

  // Calculate statistics
  const totalStudents = queue.members.length;
  const waitingStudents = queue.members.filter(m => m.status === 'waiting').length;
  const pendingStudents = queue.members.filter(m => m.status === 'pending').length;
  const servedStudents = queue.members.filter(m => m.status === 'served').length;
  
  // Calculate average wait time (in minutes)
  const servedMembers = queue.members.filter(m => m.status === 'served' && m.servedAt);
  let avgWaitTime = 0;
  
  if (servedMembers.length > 0) {
    const totalWaitTime = servedMembers.reduce((total, member) => {
      const joinedTime = new Date(member.joinedAt).getTime();
      const servedTime = new Date(member.servedAt).getTime();
      return total + (servedTime - joinedTime);
    }, 0);
    
    avgWaitTime = Math.round(totalWaitTime / (servedMembers.length * 60000)); // Convert ms to minutes
  }

  // Estimated completion time
  const estimatedCompletionMinutes = waitingStudents * queue.estimatedTimePerPerson;
  
  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Queue Statistics
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Tooltip title="Total students in queue history">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Total: <strong>{totalStudents}</strong>
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Tooltip title="Students currently waiting">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <HourglassEmptyIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Waiting: <strong>{waitingStudents}</strong>
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Tooltip title="Students served">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Served: <strong>{servedStudents}</strong>
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Tooltip title="Students pending approval">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Pending: <strong>{pendingStudents}</strong>
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Tooltip title="Average time students waited before being served">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Avg. Wait Time: <strong>{avgWaitTime} min</strong>
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Tooltip title="Estimated time to serve all waiting students">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Est. Completion: <strong>{estimatedCompletionMinutes} min</strong>
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QueueStatistics;
