import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton
} from '@mui/material';
import NoteIcon from '@mui/icons-material/Note';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

const StudentNotes = ({ studentId, studentName, initialNotes = '', onSave }) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(initialNotes);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    onSave(studentId, notes);
    handleClose();
  };

  return (
    <>
      <IconButton 
        size="small" 
        color="primary" 
        onClick={handleOpen}
        title="Add/Edit Notes"
        aria-label="Add or edit student notes"
      >
        <NoteIcon fontSize="small" />
      </IconButton>

      <Dialog 
        open={open} 
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Typography variant="h6">
            Notes for {studentName}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="notes"
            label="Student Notes"
            type="text"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this student here..."
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            These notes are only visible to mentors and admins.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
          >
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentNotes;
