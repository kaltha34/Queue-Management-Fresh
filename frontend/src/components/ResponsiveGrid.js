import React from 'react';
import { Grid, Box, useTheme, useMediaQuery } from '@mui/material';

/**
 * A responsive grid component that adjusts columns based on screen size
 * @param {Array} items - Array of items to render in the grid
 * @param {Function} renderItem - Function to render each item
 * @param {Object} spacing - Grid spacing object with xs, sm, md, lg properties
 * @param {Object} columns - Number of columns per breakpoint
 * @param {Boolean} equalHeight - Whether all items should have equal height
 */
const ResponsiveGrid = ({
  items = [],
  renderItem,
  spacing = { xs: 2, sm: 2, md: 3 },
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  equalHeight = true,
  sx = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Determine current column count based on screen size
  let currentColumns = columns.lg;
  if (isMobile) {
    currentColumns = columns.xs;
  } else if (isTablet) {
    currentColumns = columns.sm;
  } else if (useMediaQuery(theme.breakpoints.down('lg'))) {
    currentColumns = columns.md;
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Grid container spacing={spacing} sx={sx}>
      {items.map((item, index) => (
        <Grid 
          item 
          key={item.id || index}
          xs={12 / columns.xs}
          sm={12 / columns.sm}
          md={12 / columns.md}
          lg={12 / columns.lg}
          sx={{ display: 'flex' }}
        >
          <Box sx={{ 
            width: '100%', 
            height: equalHeight ? '100%' : 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {renderItem(item, index)}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default ResponsiveGrid;
