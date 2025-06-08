import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress,
  LinearProgress,
  Tooltip
} from '@mui/material';

/**
 * A reusable stats card component for displaying metrics
 * @param {string} title - The title of the stat
 * @param {string|number} value - The value to display
 * @param {string} subtitle - Optional subtitle text
 * @param {React.ReactNode} icon - Icon to display
 * @param {string} color - Color theme for the card
 * @param {number} progress - Optional progress value (0-100)
 * @param {boolean} loading - Whether the card is in loading state
 * @param {string} tooltip - Optional tooltip text
 */
const StatsCard = ({ 
  title, 
  value, 
  subtitle = '', 
  icon, 
  color = 'primary',
  progress = null,
  loading = false,
  tooltip = '',
  ...props
}) => {
  const cardContent = (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%',
        borderLeft: 4, 
        borderColor: `${color}.main`,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
      {...props}
    >
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <CircularProgress size={40} color={color} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading...
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {title}
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
              {icon && (
                <Box 
                  sx={{ 
                    p: 1.5, 
                    bgcolor: `${color}.light`, 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {React.cloneElement(icon, { sx: { color: `${color}.dark` } })}
                </Box>
              )}
            </Box>
            
            {progress !== null && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  color={color} 
                  sx={{ height: 8, borderRadius: 1 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {progress}% Complete
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return tooltip ? (
    <Tooltip title={tooltip} arrow placement="top">
      {cardContent}
    </Tooltip>
  ) : cardContent;
};

export default StatsCard;
