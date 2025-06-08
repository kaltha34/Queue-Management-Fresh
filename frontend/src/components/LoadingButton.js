import React from 'react';
import { Button, CircularProgress } from '@mui/material';

/**
 * A reusable button component with loading state
 * @param {boolean} loading - Whether the button is in loading state
 * @param {string} loadingText - Text to display during loading
 * @param {React.ReactNode} children - Button content
 * @param {boolean} disabled - Whether the button is disabled
 * @param {function} onClick - Click handler
 * @param {string} variant - Button variant
 * @param {string} color - Button color
 * @param {object} props - Additional props to pass to Button
 */
const LoadingButton = ({
  loading = false,
  loadingText = 'Loading...',
  children,
  disabled = false,
  onClick,
  variant = 'contained',
  color = 'primary',
  ...props
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      disabled={disabled || loading}
      onClick={loading ? undefined : onClick}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : props.startIcon}
      {...props}
    >
      {loading ? loadingText : children}
    </Button>
  );
};

export default LoadingButton;
