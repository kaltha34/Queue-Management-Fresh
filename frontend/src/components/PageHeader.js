import React from 'react';
import { Box, Typography, Button, Divider, useTheme, useMediaQuery } from '@mui/material';

/**
 * A reusable page header component with title, subtitle, and action button
 * @param {string} title - The page title
 * @param {string} subtitle - Optional subtitle text
 * @param {string} buttonText - Text for the action button (if any)
 * @param {function} buttonAction - Callback for the action button
 * @param {React.ReactNode} buttonIcon - Icon for the action button
 * @param {string} buttonVariant - Button variant
 * @param {string} buttonColor - Button color
 * @param {React.ReactNode} children - Additional content to render below the header
 */
const PageHeader = ({
  title,
  subtitle = '',
  buttonText = '',
  buttonAction = null,
  buttonIcon = null,
  buttonVariant = 'contained',
  buttonColor = 'primary',
  children
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ mb: 4 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center',
          mb: 2
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom={!!subtitle}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {buttonText && buttonAction && (
          <Button
            variant={buttonVariant}
            color={buttonColor}
            onClick={buttonAction}
            startIcon={buttonIcon}
            sx={{ mt: isMobile ? 2 : 0 }}
          >
            {buttonText}
          </Button>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />
      
      {children}
    </Box>
  );
};

export default PageHeader;
