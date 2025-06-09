import React, { createContext, useState, useEffect, useContext } from 'react';
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

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (socket) {
      socket.on('queueUpdate', ({ queue }) => {
        // Refresh queues when an update occurs
        fetchQueues();
        
        // If the updated queue is the current queue, refresh it
        if (currentQueue && queue === currentQueue._id) {
          fetchQueueById(queue);
        }
      });
    }
    
    return () => {
      if (socket) {
        socket.off('queueUpdate');
      }
    };
  }, [socket, currentQueue]);

  // Fetch all active queues
  const fetchQueues = async () => {
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
  };

  // Fetch all teams
  const fetchTeams = async () => {
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
  };

  // Fetch queue by ID
  const fetchQueueById = async (queueId) => {
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
  };

  // Join a queue
  const joinQueue = async (queueId, projectInterest) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to join a queue');
      return false;
    }

    try {
      console.log('Joining queue with project interest:', projectInterest);
      const res = await axiosInstance.post(`/api/queues/${queueId}/join`, { projectInterest });
      
      if (res && res.data) {
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
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error joining queue:', err);
      if (err.response) {
        setError(err.response.data?.message || 'Failed to join queue');
        toast.error(err.response.data?.message || 'Failed to join queue');
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
      console.log('Leaving queue:', queueId);
      const res = await axiosInstance.delete(`/api/queues/${queueId}/leave`);
      
      if (res && res.data) {
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
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error leaving queue:', err);
      if (err.response) {
        setError(err.response.data?.message || 'Failed to leave queue');
        toast.error(err.response.data?.message || 'Failed to leave queue');
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
      const res = await axiosInstance.put(`/api/queues/${queueId}/approve/${userId}`);
      
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
      setError(err.response?.data.message || 'Failed to approve request');
      toast.error(err.response?.data.message || 'Failed to approve request');
      return false;
    }
  };

  // Reject a queue request (only for team admin)
  const rejectRequest = async (queueId, userId) => {
    try {
      const res = await axiosInstance.post(`/api/queues/${queueId}/reject/${userId}`);
      
      // Update the queues list
      setQueues(queues.map(q => 
        q._id === queueId ? res.data : q
      ));
      
      // Update current queue if it's the one being modified
      if (currentQueue && currentQueue._id === queueId) {
        setCurrentQueue(res.data);
      }
      
      toast.success('Request rejected.');
      return res.data;
    } catch (err) {
      setError(err.response?.data.message || 'Failed to reject request');
      toast.error(err.response?.data.message || 'Failed to reject request');
      return null;
    }
  };

  // Update member notes (mentor/admin only)
  const updateMemberNotes = async (queueId, userId, notes) => {
    try {
      const res = await axiosInstance.post(`/api/queues/${queueId}/notes/${userId}`, { notes });
      
      // Update the queues list
      setQueues(queues.map(q => 
        q._id === queueId ? res.data : q
      ));
      
      // Update current queue if it's the one being modified
      if (currentQueue && currentQueue._id === queueId) {
        setCurrentQueue(res.data);
      }
      
      toast.success('Notes updated successfully.');
      return res.data;
    } catch (err) {
      setError(err.response?.data.message || 'Failed to update notes');
      toast.error(err.response?.data.message || 'Failed to update notes');
      return null;
    }
  };

  // Move to next person in queue (mentor/admin only)
  const nextInQueue = async (queueId) => {
    try {
      const res = await axiosInstance.put(`/api/queues/${queueId}/next`);
      
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
      
      toast.success('Queue updated!');
      return res.data.nextPerson;
    } catch (err) {
      setError(err.response?.data.message || 'Failed to update queue');
      toast.error(err.response?.data.message || 'Failed to update queue');
      return null;
    }
  };

  // Create a new queue (mentor/admin only)
  const createQueue = async (queueData) => {
    try {
      // Ensure date is properly formatted
      const formattedData = {
        ...queueData,
        date: new Date(queueData.date)
      };
      
      const res = await axiosInstance.post('/api/queues', formattedData);
      
      // Add the new queue to the list
      setQueues([...queues, res.data]);
      
      toast.success('Queue created successfully!');
      return res.data;
    } catch (err) {
      console.error('Create queue error:', err);
      setError(err.response?.data.message || 'Failed to create queue');
      toast.error(err.response?.data.message || 'Failed to create queue');
      return null;
    }
  };
  
  // Create a new team (mentor/admin only)
  const createTeam = async (teamData) => {
    try {
      const res = await axiosInstance.post('/api/teams', teamData);
      
      // Add the new team to the list
      setTeams([...teams, res.data]);
      
      // Automatically create a queue for the new team
      const queueData = {
        teamId: res.data._id,
        date: new Date(),
        estimatedTimePerPerson: 15
      };
      
      try {
        const queueRes = await axiosInstance.post('/api/queues', queueData);
        setQueues([...queues, queueRes.data]);
        toast.success('Team created successfully with an active queue!');
      } catch (queueErr) {
        console.error('Error creating automatic queue:', queueErr);
        toast.warning('Team created, but could not create an automatic queue.');
      }
      
      return res.data;
    } catch (err) {
      setError(err.response?.data.message || 'Failed to create team');
      toast.error(err.response?.data.message || 'Failed to create team');
      return null;
    }
  };

  // Update queue status (mentor/admin only)
  const updateQueueStatus = async (queueId, status) => {
    try {
      const res = await axiosInstance.put(`/api/queues/${queueId}/status`, { status });
      
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
      
      toast.success(`Queue ${status}!`);
      return true;
    } catch (err) {
      setError(err.response?.data.message || 'Failed to update queue status');
      toast.error(err.response?.data.message || 'Failed to update queue status');
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
    // eslint-disable-next-line
  }, [isAuthenticated, token]);

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
/ /  
 