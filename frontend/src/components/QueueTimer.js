import React, { useState, useEffect } from 'react';
import { Box, Typography, Tooltip, LinearProgress } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const QueueTimer = ({ position, averageTimePerStudent, startTime }) => {
  const [remainingTime, setRemainingTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Calculate estimated time based on position and average time per student
    const estimatedWaitingTime = position * (averageTimePerStudent || 15); // Default to 15 minutes if not provided
    setRemainingTime(estimatedWaitingTime);

    // Calculate elapsed time if startTime is provided
    if (startTime) {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const elapsed = Math.floor((now - start) / (1000 * 60)); // in minutes
      setElapsedTime(elapsed);
      
      // Calculate progress percentage
      const totalTime = elapsed + estimatedWaitingTime;
      const progressPercent = totalTime > 0 ? (elapsed / totalTime) * 100 : 0;
      setProgress(Math.min(progressPercent, 100)); // Cap at 100%
    }

    // Update timer every minute
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      
      // Recalculate progress
      const totalTime = elapsedTime + 1 + remainingTime;
      const progressPercent = totalTime > 0 ? ((elapsedTime + 1) / totalTime) * 100 : 0;
      setProgress(Math.min(progressPercent, 100));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [position, averageTimePerStudent, startTime, elapsedTime, remainingTime]);

  // Format time display
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          Estimated wait: {formatTime(remainingTime)}
        </Typography>
      </Box>
      
      <Tooltip title={`Position: ${position} • Elapsed: ${formatTime(elapsedTime)} • Remaining: ${formatTime(remainingTime)}`}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: progress > 80 ? 'success.main' : 'primary.main',
              }
            }} 
          />
        </Box>
      </Tooltip>
    </Box>
  );
};

export default QueueTimer;
