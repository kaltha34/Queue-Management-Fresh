import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import AuthContext from './AuthContext';
import axiosInstance from '../utils/axiosConfig';

const QueueContext = createContext();

export const QueueProvider = ({ children }) => {
  const { isAuthenticated, token } = useContext(AuthContext);
  const [queues, setQueues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentQueue, setCurrentQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // Initialize socket connection with error handling
  useEffect(() => {
    try {
      const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      console.log('Initializing socket connection to:', socketUrl);
      
      const newSocket = io(socketUrl, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });
      
      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
      });
      
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        // Don't show toast for socket connection errors to avoid spamming
        // The axiosConfig.js health check will handle showing connectivity issues
      });
      
      newSocket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`Socket reconnection attempt ${attemptNumber}`);
      });
      
      newSocket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed after maximum attempts');
      });
      
      setSocket(newSocket);
      
      return () => {
        console.log('Disconnecting socket');
        newSocket.disconnect();
      };
    } catch (error) {
      console.error('Error setting up socket connection:', error);
    }
  }, []);

  // Fetch all active queues
  const fetchQueues = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching queues...');
      const res = await axiosInstance.get('/api/queues');
      if (res && res.data) {
        setQueues(res.data);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching queues:', err);
      // Only show toast for specific errors, not connection errors
      if (err.response) {
        setError(err.response.data?.message || 'Failed to fetch queues');
        // Only show toast for specific API errors, not general connection errors
        if (err.response.status !== 404 && err.response.status !== 500) {
          toast.error(err.response.data?.message || 'Failed to fetch queues');
        }
      } else {
        setError('Cannot connect to server. Please check if the backend is running.');
        // Don't show toast for connection errors to avoid spamming the user
      }
    }
    setLoading(false);
  }, []);

  // Fetch queue by ID
  const fetchQueueById = useCallback(async (queueId) => {
    setLoading(true);
    try {
      console.log(`Fetching queue ${queueId}...`);
      const res = await axiosInstance.get(`/api/queues/${queueId}`);
      if (res && res.data) {
        setCurrentQueue(res.data);
        setError(null);
        return res.data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error(`Error fetching queue ${queueId}:`, err);
      // Only show toast for specific errors, not connection errors
      if (err.response) {
        setError(err.response.data?.message || 'Failed to fetch queue');
        // Only show toast for specific API errors, not general connection errors
        if (err.response.status !== 404 && err.response.status !== 500) {
          toast.error(err.response.data?.message || 'Failed to fetch queue');
        }
      } else {
        setError('Cannot connect to server. Please check if the backend is running.');
        // Don't show toast for connection errors to avoid spamming the user
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Define socket event handlers outside useEffect to avoid dependency issues
  const handleQueueUpdate = useCallback(({ queue }) => {
    try {
      if (!queue) {
        console.error('Received queueUpdate event with missing queue ID');
        return;
      }
      
      console.log(`Received queueUpdate event for queue: ${queue}`);
      // Refresh queues when an update occurs
      fetchQueues();
      
      // If the updated queue is the current queue, refresh it
      if (currentQueue && queue === currentQueue._id) {
        fetchQueueById(queue);
      }
    } catch (error) {
      console.error('Error handling queue update event:', error);
    }
  }, [currentQueue, fetchQueues, fetchQueueById]);
  
  const handleNextInQueue = useCallback(({ queueId }) => {
    try {
      if (!queueId) {
        console.error('Received nextInQueue event with missing queue ID');
        return;
      }
      
      console.log(`Received nextInQueue event for queue: ${queueId}`);
      fetchQueues();
      
      if (currentQueue && queueId === currentQueue._id) {
        fetchQueueById(queueId);
      }
    } catch (error) {
      console.error('Error handling next in queue event:', error);
    }
  }, [currentQueue, fetchQueues, fetchQueueById]);

  // Set up socket event listeners with improved error handling
  useEffect(() => {
    if (!socket) return;
    
    // Register event listeners
    socket.on('queueUpdate', handleQueueUpdate);
    socket.on('nextInQueue', handleNextInQueue);
    socket.on('joinQueue', handleQueueUpdate);
    socket.on('leaveQueue', handleQueueUpdate);
    
    // Clean up event listeners
    return () => {
      if (socket) {
        socket.off('queueUpdate', handleQueueUpdate);
        socket.off('nextInQueue', handleNextInQueue);
        socket.off('joinQueue', handleQueueUpdate);
        socket.off('leaveQueue', handleQueueUpdate);
      }
    };
  }, [socket, handleQueueUpdate, handleNextInQueue]);

  // Fetch all teams
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching teams...');
      const res = await axiosInstance.get('/api/teams');
      if (res && res.data) {
        setTeams(res.data);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      // Only show toast for specific errors, not connection errors
      if (err.response) {
        setError(err.response.data?.message || 'Failed to fetch teams');
        // Only show toast for specific API errors, not general connection errors
        if (err.response.status !== 404 && err.response.status !== 500) {
          toast.error(err.response.data?.message || 'Failed to fetch teams');
        }
      } else {
        setError('Cannot connect to server. Please check if the backend is running.');
        // Don't show toast for connection errors to avoid spamming the user
      }
    }
    setLoading(false);
  }, []);

  // Join a queue
  const joinQueue = async (queueId, projectInterest) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to join a queue');
      return false;
    }

    try {
      if (!queueId) {
        throw new Error('Missing queue ID');
      }
      
      // Validate project interest
      if (!projectInterest || projectInterest.trim() === '') {
        throw new Error('Please provide a brief description of what you need help with');
      }
      
      console.log(`Joining queue ${queueId} with project interest: ${projectInterest}`);
      const res = await axiosInstance.post(`/api/queues/${queueId}/join`, { projectInterest });
      
      if (!res || !res.data) {
        throw new Error('Invalid response from server');
      }
      
      // Check if the queue is active before allowing join
      if (res.data.status !== 'active') {
        throw new Error(`Cannot join queue because it is currently ${res.data.status}`);
      }
      
      // Update the queues list
      setQueues(queues.map(q => 
        q._id === queueId ? res.data : q
      ));
      
      // Update current queue if it's the one being joined
      if (currentQueue && currentQueue._id === queueId) {
        setCurrentQueue(res.data);
      }
      
      // Emit socket event
      if (socket) {
        socket.emit('joinQueue', { queueId });
      }
      
      toast.success('Request submitted! Waiting for admin approval.');
      return true;
    } catch (err) {
      console.error('Error joining queue:', err);
      
      // Handle specific error cases
      if (err.response) {
        // Handle specific HTTP status codes
        switch (err.response.status) {
          case 400: // Bad request
            setError(err.response.data?.message || 'Invalid request to join queue');
            toast.error(err.response.data?.message || 'Invalid request to join queue');
            break;
          case 403: // Forbidden
            setError('You do not have permission to join this queue');
            toast.error('You do not have permission to join this queue');
            break;
          case 409: // Conflict
            setError('You are already in this queue or another active queue');
            toast.warning('You are already in this queue or another active queue');
            break;
          default:
            setError(err.response.data?.message || 'Failed to join queue');
            toast.error(err.response.data?.message || 'Failed to join queue');
        }
      } else {
        setError(err.message || 'Failed to join queue. Check server connection.');
        toast.error(err.message || 'Failed to join queue. Check server connection.');
      }
      
      return false;
    }
  };

  // Leave a queue
  const leaveQueue = async (queueId) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to leave a queue');
      return false;
    }

    try {
      if (!queueId) {
        throw new Error('Missing queue ID');
      }
      
      console.log(`Leaving queue: ${queueId}`);
      const res = await axiosInstance.delete(`/api/queues/${queueId}/leave`);
      
      if (!res || !res.data) {
        throw new Error('Invalid response from server');
      }
      
      // Update the queues list
      setQueues(queues.map(q => 
        q._id === queueId ? res.data : q
      ));
      
      // Update current queue if it's the one being left
      if (currentQueue && currentQueue._id === queueId) {
        setCurrentQueue(res.data);
      }
      
      // Emit socket event
      if (socket) {
        socket.emit('leaveQueue', { queueId });
      }
      
      toast.success('Successfully left the queue!');
      return true;
    } catch (err) {
      console.error(`Error leaving queue ${queueId}:`, err);
      
      // Handle specific error cases
      if (err.response) {
        // Handle specific HTTP status codes
        switch (err.response.status) {
          case 400: // Bad request
            setError(err.response.data?.message || 'Invalid request to leave queue');
            toast.error(err.response.data?.message || 'Invalid request to leave queue');
            break;
          case 403: // Forbidden
            setError('You do not have permission to leave this queue');
            toast.error('You do not have permission to leave this queue');
            break;
          case 404: // Not found
            setError('You are not in this queue or the queue does not exist');
            toast.warning('You are not in this queue or the queue does not exist');
            break;
          default:
            setError(err.response.data?.message || 'Failed to leave queue');
            toast.error(err.response.data?.message || 'Failed to leave queue');
        }
      } else {
        setError(err.message || 'Failed to leave queue. Check server connection.');
        toast.error(err.message || 'Failed to leave queue. Check server connection.');
      }
      
      return false;
    }
  };

  // Approve a queue request (only for team admin)
  const approveRequest = async (queueId, userId) => {
    try {
      if (!queueId || !userId) {
        throw new Error('Missing queue ID or user ID');
      }
      
      const res = await axiosInstance.put(`/api/queues/${queueId}/approve/${userId}`);
      
      if (!res || !res.data) {
        throw new Error('Invalid response from server');
      }
      
      // Update the queues list
      setQueues(queues.map(q => 
        q._id === queueId ? res.data : q
      ));
      
      // Update current queue if it's the one being updated
      if (currentQueue && currentQueue._id === queueId) {
        setCurrentQueue(res.data);
      }
      
      // Emit socket event
      if (socket) {
        socket.emit('queueUpdate', { queueId });
      }
      
      toast.success('Request approved!');
      return true;
    } catch (err) {
      console.error(`Error approving request for user ${userId} in queue ${queueId}:`, err);
      
      if (err.response) {
        setError(err.response.data?.message || 'Failed to approve request');
        toast.error(err.response.data?.message || 'Failed to approve request');
      } else {
        setError(err.message || 'Failed to approve request. Check server connection.');
        toast.error(err.message || 'Failed to approve request. Check server connection.');
      }
      
      return false;
    }
  };

  // Reject a queue request (only for team admin)
  const rejectRequest = async (queueId, userId) => {
    try {
      if (!queueId || !userId) {
        throw new Error('Missing queue ID or user ID');
      }
      
      const res = await axiosInstance.post(`/api/queues/${queueId}/reject/${userId}`);
      
      if (!res || !res.data) {
        throw new Error('Invalid response from server');
      }
      
      // Update the queues list
      setQueues(queues.map(q => 
        q._id === queueId ? res.data : q
      ));
      
      // Update current queue if it's the one being modified
      if (currentQueue && currentQueue._id === queueId) {
        setCurrentQueue(res.data);
      }
      
      // Emit socket event to notify other users
      if (socket) {
        socket.emit('queueUpdate', { queueId });
      }
      
      toast.success('Request rejected.');
      return res.data;
    } catch (err) {
      console.error(`Error rejecting request for user ${userId} in queue ${queueId}:`, err);
      
      if (err.response) {
        setError(err.response.data?.message || 'Failed to reject request');
        toast.error(err.response.data?.message || 'Failed to reject request');
      } else {
        setError(err.message || 'Failed to reject request. Check server connection.');
        toast.error(err.message || 'Failed to reject request. Check server connection.');
      }
      
      return null;
    }
  };

  // Update member notes (mentor/admin only)
  const updateMemberNotes = async (queueId, userId, notes) => {
    try {
      console.log('Updating notes for user:', userId, 'in queue:', queueId);
      const res = await axiosInstance.post(`/api/queues/${queueId}/notes/${userId}`, { notes });
      
      if (res && res.data) {
        // Update the queues list
        setQueues(queues.map(q => 
          q._id === queueId ? res.data : q
        ));
        
        // Update current queue if it's the one being modified
        if (currentQueue && currentQueue._id === queueId) {
          setCurrentQueue(res.data);
        }
        
        // Emit socket event if available
        if (socket) {
          socket.emit('queueUpdate', { queueId });
        }
        
        toast.success('Notes updated successfully.');
        return res.data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error updating notes:', err);
      if (err.response) {
        setError(err.response.data?.message || 'Failed to update notes');
        toast.error(err.response.data?.message || 'Failed to update notes');
      } else {
        setError(err.message || 'Failed to update notes. Check server connection.');
        toast.error(err.message || 'Failed to update notes. Check server connection.');
      }
      return null;
    }
  };

  // Move to next person in queue (mentor/admin only)
  const nextInQueue = async (queueId) => {
    try {
      if (!queueId) {
        throw new Error('Missing queue ID');
      }
      
      const res = await axiosInstance.put(`/api/queues/${queueId}/next`);
      
      if (!res || !res.data || !res.data.queue) {
        throw new Error('Invalid response from server');
      }
      
      // Update the queues list
      setQueues(queues.map(q => 
        q._id === queueId ? res.data.queue : q
      ));
      
      // Update current queue if it's the one being updated
      if (currentQueue && currentQueue._id === queueId) {
        setCurrentQueue(res.data.queue);
      }
      
      // Emit socket event
      if (socket) {
        socket.emit('nextInQueue', { queueId });
      }
      
      // Show different toast messages based on whether there was a next person
      if (res.data.nextPerson) {
        toast.success('Queue updated! Next student is now being helped.');
      } else {
        toast.info('Queue updated! No more students in the queue.');
      }
      
      return res.data.nextPerson;
    } catch (err) {
      console.error(`Error moving to next person in queue ${queueId}:`, err);
      
      if (err.response) {
        setError(err.response.data?.message || 'Failed to update queue');
        toast.error(err.response.data?.message || 'Failed to update queue');
      } else {
        setError(err.message || 'Failed to update queue. Check server connection.');
        toast.error(err.message || 'Failed to update queue. Check server connection.');
      }
      
      return null;
    }
  };

  // Create a new queue (mentor/admin only)
  const createQueue = async (queueData) => {
    try {
      if (!queueData || !queueData.teamId) {
        throw new Error('Missing required queue data');
      }
      
      // Ensure date is properly formatted
      const formattedData = {
        ...queueData,
        date: new Date(queueData.date || new Date())
      };
      
      // Set default estimated time if not provided
      if (!formattedData.estimatedTimePerPerson) {
        formattedData.estimatedTimePerPerson = 15; // Default 15 minutes per student
      }
      
      console.log('Creating new queue with data:', formattedData);
      const res = await axiosInstance.post('/api/queues', formattedData);
      
      if (!res || !res.data) {
        throw new Error('Invalid response from server');
      }
      
      // Add the new queue to the list
      setQueues([...queues, res.data]);
      
      // Emit socket event to notify other users
      if (socket) {
        socket.emit('queueUpdate', { queueId: res.data._id });
      }
      
      toast.success('Queue created successfully!');
      return res.data;
    } catch (err) {
      console.error('Create queue error:', err);
      
      if (err.response) {
        setError(err.response.data?.message || 'Failed to create queue');
        toast.error(err.response.data?.message || 'Failed to create queue');
      } else {
        setError(err.message || 'Failed to create queue. Check server connection.');
        toast.error(err.message || 'Failed to create queue. Check server connection.');
      }
      
      return null;
    }
  };
  
  // Create a new team (mentor/admin only)
  const createTeam = async (teamData) => {
    try {
      if (!teamData || !teamData.name) {
        throw new Error('Missing required team data');
      }
      
      console.log('Creating new team with data:', teamData);
      const res = await axiosInstance.post('/api/teams', teamData);
      
      if (!res || !res.data) {
        throw new Error('Invalid response from server');
      }
      
      // Add the new team to the list
      setTeams([...teams, res.data]);
      
      // Automatically create a queue for the new team
      const queueData = {
        teamId: res.data._id,
        date: new Date(),
        estimatedTimePerPerson: 15
      };
      
      try {
        console.log('Automatically creating queue for new team:', queueData);
        const queueRes = await axiosInstance.post('/api/queues', queueData);
        
        if (queueRes && queueRes.data) {
          setQueues([...queues, queueRes.data]);
          
          // Emit socket event to notify other users
          if (socket) {
            socket.emit('queueUpdate', { queueId: queueRes.data._id });
          }
          
          toast.success('Team created successfully with an active queue!');
        } else {
          throw new Error('Invalid response when creating queue');
        }
      } catch (queueErr) {
        console.error('Error creating automatic queue:', queueErr);
        toast.warning('Team created, but could not create an automatic queue.');
      }
      
      return res.data;
    } catch (err) {
      console.error('Create team error:', err);
      
      if (err.response) {
        setError(err.response.data?.message || 'Failed to create team');
        toast.error(err.response.data?.message || 'Failed to create team');
      } else {
        setError(err.message || 'Failed to create team. Check server connection.');
        toast.error(err.message || 'Failed to create team. Check server connection.');
      }
      
      return null;
    }
  };

  // Update queue status (mentor/admin only)
  const updateQueueStatus = async (queueId, status) => {
    try {
      if (!queueId) {
        throw new Error('Missing queue ID');
      }
      
      if (!status || !['active', 'paused', 'closed'].includes(status)) {
        throw new Error('Invalid queue status provided');
      }
      
      const res = await axiosInstance.put(`/api/queues/${queueId}/status`, { status });
      
      if (!res || !res.data) {
        throw new Error('Invalid response from server');
      }
      
      // Update the queues list
      setQueues(queues.map(q => 
        q._id === queueId ? res.data : q
      ));
      
      // Update current queue if it's the one being updated
      if (currentQueue && currentQueue._id === queueId) {
        setCurrentQueue(res.data);
      }
      
      // Emit socket event
      if (socket) {
        socket.emit('queueUpdate', { queueId });
      }
      
      // Show appropriate success message based on status
      const statusMessages = {
        active: 'Queue is now active!',
        paused: 'Queue has been paused!',
        closed: 'Queue has been closed!'
      };
      
      toast.success(statusMessages[status] || `Queue ${status}!`);
      return true;
    } catch (err) {
      console.error(`Error updating queue ${queueId} status to ${status}:`, err);
      
      if (err.response) {
        setError(err.response.data?.message || 'Failed to update queue status');
        toast.error(err.response.data?.message || 'Failed to update queue status');
      } else {
        setError(err.message || 'Failed to update queue status. Check server connection.');
        toast.error(err.message || 'Failed to update queue status. Check server connection.');
      }
      
      return false;
    }
  };

  // Get user's position in queue
  const getUserQueuePosition = (queue, userId) => {
    if (!queue || !userId) return null;
    
    const userInQueue = queue.members.find(
      member => member.user._id === userId && member.status === 'waiting'
    );
    
    if (!userInQueue) return null;
    
    const position = queue.members.filter(
      member => member.status === 'waiting' && member.queueNumber < userInQueue.queueNumber
    ).length + 1;
    
    return {
      position,
      queueNumber: userInQueue.queueNumber,
      estimatedWaitTime: position * queue.estimatedTimePerPerson
    };
  };

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchQueues();
      fetchTeams();
    }
  }, [isAuthenticated, fetchQueues, fetchTeams]);

  return (
    <QueueContext.Provider
      value={{
        queues,
        teams,
        currentQueue,
        loading,
        error,
        fetchQueues,
        fetchTeams,
        fetchQueueById,
        joinQueue,
        leaveQueue,
        nextInQueue,
        createQueue,
        createTeam,
        updateQueueStatus,
        approveRequest,
        rejectRequest,
        updateMemberNotes,
        getUserQueuePosition,
        setCurrentQueue
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export default QueueContext;