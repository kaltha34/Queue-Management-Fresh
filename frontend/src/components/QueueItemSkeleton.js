import React from 'react';
import { 
  Box, 
  Skeleton, 
  Card, 
  CardContent,
  Divider
} from '@mui/material';

const QueueItemSkeleton = ({ count = 3 }) => {
  return (
    <Card elevation={1} sx={{ mb: 2 }}>
      <CardContent>
        <Skeleton variant="rectangular" width="40%" height={28} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" width="20%" height={24} sx={{ mb: 2 }} />
        
        {Array.from(new Array(count)).map((_, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Divider sx={{ my: 2 }} />}
            <Box sx={{ display: 'flex', mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ width: '100%' }}>
                <Skeleton variant="rectangular" width="60%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="40%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="90%" height={60} />
              </Box>
            </Box>
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
};

export default QueueItemSkeleton;
