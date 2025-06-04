import React, { useEffect, useRef } from 'react';
import { useContext } from 'react';
import QueueContext from '../context/QueueContext';
import notificationSound from '../assets/notification.mp3';

const NotificationSound = () => {
  const { queues } = useContext(QueueContext);
  const audioRef = useRef(null);
  const previousQueuesRef = useRef([]);
  
  useEffect(() => {
    // Skip first render
    if (previousQueuesRef.current.length === 0) {
      previousQueuesRef.current = queues;
      return;
    }

    // Check if any queue has new members compared to previous state
    const hasNewMembers = queues.some(queue => {
      const prevQueue = previousQueuesRef.current.find(q => q._id === queue._id);
      if (!prevQueue) return true; // New queue
      
      // Check if there are new pending members
      const newPendingCount = queue.members.filter(m => m.status === 'pending').length;
      const prevPendingCount = prevQueue.members.filter(m => m.status === 'pending').length;
      
      return newPendingCount > prevPendingCount;
    });

    // Play sound if there are new members
    if (hasNewMembers && audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error('Failed to play notification sound:', error);
      });
    }

    // Update previous queues reference
    previousQueuesRef.current = queues;
  }, [queues]);

  return (
    <audio ref={audioRef} src={notificationSound} preload="auto" />
  );
};

export default NotificationSound;
