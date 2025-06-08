import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { toast } from 'react-toastify';

/**
 * A reusable component to copy text to clipboard
 * @param {string} text - The text to copy
 * @param {string} tooltip - The tooltip text to display
 * @param {string} successMessage - The message to display on successful copy
 * @param {string} size - The size of the icon button
 * @param {string} color - The color of the icon button
 */
const CopyToClipboard = ({
  text,
  tooltip = 'Copy to clipboard',
  successMessage = 'Copied to clipboard!',
  size = 'small',
  color = 'inherit',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(successMessage);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
      toast.error('Failed to copy text to clipboard');
    }
  };

  return (
    <Tooltip title={copied ? 'Copied!' : tooltip} placement="top" arrow>
      <IconButton 
        onClick={handleCopy} 
        size={size} 
        color={copied ? 'success' : color}
        aria-label="copy to clipboard"
      >
        {copied ? <CheckCircleOutlineIcon fontSize={size} /> : <ContentCopyIcon fontSize={size} />}
      </IconButton>
    </Tooltip>
  );
};

export default CopyToClipboard;
