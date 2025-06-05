import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  InputAdornment,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

const QueueSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search by student name..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <Tooltip title="Clear search">
                  <IconButton
                    edge="end"
                    onClick={clearSearch}
                    size="small"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ) : null
          }}
        />
        {searchTerm && (
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<DeleteSweepIcon />} 
            onClick={clearSearch}
            size="small"
          >
            Clear All
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default QueueSearch;
