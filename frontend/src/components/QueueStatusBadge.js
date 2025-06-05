import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const QueueStatusBadge = ({ status, size = 'small' }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'active':
        return {
          label: 'Active',
          color: 'success',
          icon: <CheckCircleIcon fontSize={size === 'small' ? 'small' : 'medium'} />,
          tooltip: 'Queue is active and accepting new students'
        };
      case 'paused':
        return {
          label: 'Paused',
          color: 'warning',
          icon: <PauseCircleIcon fontSize={size === 'small' ? 'small' : 'medium'} />,
          tooltip: 'Queue is temporarily paused'
        };
      case 'closed':
        return {
          label: 'Closed',
          color: 'error',
          icon: <CancelIcon fontSize={size === 'small' ? 'small' : 'medium'} />,
          tooltip: 'Queue is closed and not accepting new students'
        };
      default:
        return {
          label: 'Unknown',
          color: 'default',
          icon: <HourglassEmptyIcon fontSize={size === 'small' ? 'small' : 'medium'} />,
          tooltip: 'Queue status unknown'
        };
    }
  };

  const { label, color, icon, tooltip } = getStatusConfig();

  return (
    <Tooltip title={tooltip}>
      <Chip
        icon={icon}
        label={label}
        color={color}
        size={size}
        variant="outlined"
        sx={{
          fontWeight: 500,
          '& .MuiChip-icon': {
            marginLeft: '4px'
          }
        }}
      />
    </Tooltip>
  );
};

export default QueueStatusBadge;
