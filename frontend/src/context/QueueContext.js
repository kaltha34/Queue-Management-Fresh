import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import AuthContext from './AuthContext';

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
      const res = await axios.get('/api/queues');
      setQueues(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data.message || 'Failed to fetch queues');
      toast.error(err.response?.data.message || 'Failed to fetch queues');
    }
    setLoading(false);
  };

  // Fetch all teams
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/teams');
      setTeams(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data.message || 'Failed to fetch teams');
      toast.error(err.response?.data.message || 'Failed to fetch teams');
    }
    setLoading(false);
  };

  // Fetch queue by ID
  const fetchQueueById = async (queueId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/queues/${queueId}`);
      setCurrentQueue(res.data);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data.message || 'Failed to fetch queue');
      toast.error(err.response?.data.message || 'Failed to fetch queue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Join a queue
  const joinQueue = async (queueId) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to join a queue');
      return false;
    }

    try {
      const res = await axios.post(`/api/queues/${queueId}/join`);
      
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
      
      toast.success('Successfully joined the queue!');
      return true;
    } catch (err) {
      setError(err.response?.data.message || 'Failed to join queue');
      toast.error(err.response?.data.message || 'Failed to join queue');
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
      const res = await axios.put(`/api/queues/${queueId}/leave`);
      
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
      setError(err.response?.data.message || 'Failed to leave queue');
      toast.error(err.response?.data.message || 'Failed to leave queue');
      return false;
    }
  };

  // Move to next person in queue (mentor/admin only)
  const nextInQueue = async (queueId) => {
    try {
      const res = await axios.put(`/api/queues/${queueId}/next`);
      
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
      const res = await axios.post('/api/queues', queueData);
      
      // Add the new queue to the list
      setQueues([...queues, res.data]);
      
      toast.success('Queue created successfully!');
      return res.data;
    } catch (err) {
      setError(err.response?.data.message || 'Failed to create queue');
      toast.error(err.response?.data.message || 'Failed to create queue');
      return null;
    }
  };
  
  // Create a new team (mentor/admin only)
  const createTeam = async (teamData) => {
    try {
      const res = await axios.post('/api/teams', teamData);
      
      // Add the new team to the list
      setTeams([...teams, res.data]);
      
      toast.success('Team created successfully!');
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
      const res = await axios.put(`/api/queues/${queueId}/status`, { status });
      
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
        getUserQueuePosition,
        setCurrentQueue
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export default QueueContext;
