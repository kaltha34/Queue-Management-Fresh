import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

/**
 * A reusable empty state component to display when there's no content
 * @param {string} title - The main message to display
 * @param {string} description - Additional description text
 * @param {React.ReactNode} icon - Custom icon to display (defaults to InboxIcon)
 * @param {string} buttonText - Text for the action button (if any)
 * @param {function} buttonAction - Callback for the action button
 * @param {string} imageUrl - Optional image URL to display instead of an icon
 */
const EmptyState = ({
  title = 'No items found',
  description = 'There are no items to display at the moment.',
  icon = <InboxIcon sx={{ fontSize: 80 }} />,
  buttonText = '',
  buttonAction = null,
  imageUrl = null,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        textAlign: 'center',
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px dashed',
        borderColor: 'divider',
        my: 3
      }}
    >
      <Box sx={{ mb: 3 }}>
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt="Empty state"
            sx={{ height: 150, maxWidth: '100%' }}
          />
        ) : (
          <Box sx={{ color: 'text.secondary', mb: 2 }}>
            {icon}
          </Box>
        )}
      </Box>

      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        {description}
      </Typography>
      
      {buttonText && buttonAction && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={buttonAction}
          sx={{ mt: 2 }}
        >
          {buttonText}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;
