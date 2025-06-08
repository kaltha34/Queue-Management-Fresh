import React from 'react';
import { Box, Pagination, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

/**
 * A reusable pagination component with page size selector
 * @param {number} page - Current page number (1-based)
 * @param {number} count - Total number of pages
 * @param {number} pageSize - Current page size
 * @param {array} pageSizeOptions - Available page size options
 * @param {function} onPageChange - Callback when page changes
 * @param {function} onPageSizeChange - Callback when page size changes
 */
const SimplePagination = ({
  page = 1,
  count = 1,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  onPageChange,
  onPageSizeChange,
}) => {
  const handlePageChange = (event, newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const handlePageSizeChange = (event) => {
    if (onPageSizeChange) {
      onPageSizeChange(event.target.value);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      flexDirection: { xs: 'column', sm: 'row' },
      gap: 2,
      mt: 2 
    }}>
      <Pagination 
        count={count} 
        page={page} 
        onChange={handlePageChange} 
        color="primary" 
        showFirstButton 
        showLastButton
        size="medium"
      />
      
      <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="page-size-select-label">Page Size</InputLabel>
        <Select
          labelId="page-size-select-label"
          id="page-size-select"
          value={pageSize}
          onChange={handlePageSizeChange}
          label="Page Size"
        >
          {pageSizeOptions.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default SimplePagination;
