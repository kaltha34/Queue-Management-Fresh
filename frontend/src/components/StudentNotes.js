import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import NoteIcon from '@mui/icons-material/Note';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

const StudentNotes = ({ studentId, studentName, initialNotes = '', onSave }) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notesChanged, setNotesChanged] = useState(false);

  // Reset notes when initialNotes prop changes
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const handleOpen = () => {
    setOpen(true);
    setError(null);
    setNotesChanged(false);
    // Reset notes to initial value when opening dialog
    setNotes(initialNotes);
  };

  const handleClose = () => {
    // Show confirmation if notes have been changed but not saved
    if (notesChanged && notes !== initialNotes) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setOpen(false);
        setError(null);
      }
    } else {
      setOpen(false);
      setError(null);
    }
  };

  const handleChange = (e) => {
    setNotes(e.target.value);
    setNotesChanged(true);
  };

  const handleSave = async () => {
    if (!studentId) {
      setError('Student ID is missing. Cannot save notes.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Trim notes to remove unnecessary whitespace
      const trimmedNotes = notes.trim();
      
      // Call the onSave function and await its result
      await onSave(studentId, trimmedNotes);
      
      setNotesChanged(false);
      handleClose();
    } catch (err) {
      console.error('Error saving notes:', err);
      setError(err.message || 'Failed to save notes. Please try again.');
    } finally {
      setSaving(false);
    }
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
        disableEscapeKeyDown={saving}
      >
        <DialogTitle>
          <Typography variant="h6">
            Notes for {studentName || 'Student'}
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
            disabled={saving}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
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
            onChange={handleChange}
            placeholder="Add notes about this student here..."
            disabled={saving}
            inputProps={{ maxLength: 1000 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            These notes are only visible to mentors and admins. Maximum 1000 characters.
            {notes && (
              <span> {notes.length}/1000 characters used.</span>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={saving || (!notesChanged && notes === initialNotes)}
          >
            {saving ? 'Saving...' : 'Save Notes'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentNotes;
