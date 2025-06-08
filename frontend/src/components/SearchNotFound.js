import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';

/**
 * Component to display when search results are empty
 * @param {string} searchQuery - The search query that returned no results
 * @param {string} message - Custom message to display (optional)
 */
const SearchNotFound = ({ searchQuery = '', message = null }) => {
  const defaultMessage = searchQuery 
    ? `No results found for "${searchQuery}"`
    : 'No results found';

  return (
    <Paper
      sx={{
        p: 3,
        mt: 3,
        mb: 3,
        textAlign: 'center',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <SearchOffIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {message || defaultMessage}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Try adjusting your search or filter to find what you're looking for.
      </Typography>
    </Paper>
  );
};

export default SearchNotFound;
