import React from 'react';
import { Avatar, Tooltip, Box } from '@mui/material';

/**
 * A reusable user avatar component with initials fallback
 * @param {string} name - User's full name
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for the image
 * @param {string} size - Size of the avatar (small, medium, large)
 * @param {boolean} showTooltip - Whether to show the name in a tooltip
 * @param {string} status - Online status (online, away, offline)
 */
const UserAvatar = ({
  name = '',
  src = '',
  alt = '',
  size = 'medium',
  showTooltip = true,
  status = null,
  ...props
}) => {
  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Determine avatar size
  const sizeMap = {
    small: { avatar: 32, badge: 8 },
    medium: { avatar: 40, badge: 10 },
    large: { avatar: 56, badge: 12 },
    xlarge: { avatar: 80, badge: 16 }
  };

  const avatarSize = sizeMap[size] || sizeMap.medium;

  // Generate a consistent color based on name
  const getAvatarColor = (name) => {
    if (!name) return '#757575';
    const colors = [
      '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', 
      '#c2185b', '#0288d1', '#303f9f', '#00796b', 
      '#689f38', '#fbc02d', '#ef6c00', '#6d4c41'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Status indicator colors
  const statusColors = {
    online: '#4caf50',
    away: '#ff9800',
    offline: '#bdbdbd',
    busy: '#f44336'
  };

  const avatar = (
    <Box sx={{ position: 'relative' }}>
      <Avatar
        src={src}
        alt={alt || name}
        sx={{
          width: avatarSize.avatar,
          height: avatarSize.avatar,
          bgcolor: !src ? getAvatarColor(name) : undefined,
          fontSize: `${avatarSize.avatar * 0.4}px`,
          fontWeight: 'bold'
        }}
        {...props}
      >
        {!src && getInitials(name)}
      </Avatar>
      
      {status && statusColors[status] && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: avatarSize.badge,
            height: avatarSize.badge,
            borderRadius: '50%',
            bgcolor: statusColors[status],
            border: '2px solid #fff'
          }}
        />
      )}
    </Box>
  );

  return showTooltip && name ? (
    <Tooltip title={name} arrow>
      {avatar}
    </Tooltip>
  ) : avatar;
};

export default UserAvatar;
