import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const KeyboardShortcuts = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger shortcuts if no input elements are focused
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      // Ctrl + Key shortcuts
      if (e.ctrlKey) {
        switch (e.key) {
          case 'h': // Home
            e.preventDefault();
            navigate('/');
            toast.info('Navigated to Home');
            break;
          case 'd': // Dashboard
            e.preventDefault();
            navigate('/dashboard');
            toast.info('Navigated to Dashboard');
            break;
          case 'q': // Queue Management
            e.preventDefault();
            navigate('/queue-management');
            toast.info('Navigated to Queue Management');
            break;
          case 'p': // Profile
            e.preventDefault();
            navigate('/profile');
            toast.info('Navigated to Profile');
            break;
          default:
            break;
        }
      } else {
        // Single key shortcuts
        switch (e.key) {
          case '?': // Show help
            e.preventDefault();
            toast.info(
              <div>
                <h4>Keyboard Shortcuts</h4>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  <li><strong>Ctrl + H</strong>: Home</li>
                  <li><strong>Ctrl + D</strong>: Dashboard</li>
                  <li><strong>Ctrl + Q</strong>: Queue Management</li>
                  <li><strong>Ctrl + P</strong>: Profile</li>
                  <li><strong>?</strong>: Show this help</li>
                </ul>
              </div>,
              { autoClose: 8000 }
            );
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, location]);

  return null; // This component doesn't render anything
};

export default KeyboardShortcuts;
