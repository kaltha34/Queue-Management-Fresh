import React from 'react';
import { Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

/**
 * A reusable info tooltip component that displays helpful information
 * @param {string} title - The tooltip text to display
 * @param {object} props - Additional props to pass to the Tooltip component
 */
const InfoTooltip = ({ title, size = 'small', color = 'primary', ...props }) => {
  return (
    <Tooltip title={title} arrow placement="top" {...props}>
      <IconButton size={size} color={color} sx={{ p: 0.5 }}>
        <InfoIcon fontSize={size} />
      </IconButton>
    </Tooltip>
  );
};

export default InfoTooltip;
