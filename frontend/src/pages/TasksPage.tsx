import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import TaskList from '@/features/tasks/components/TaskList';

const TasksPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.first_name || 'User'}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your tasks and stay organized
        </Typography>
      </Box>
      
      <TaskList />
    </Container>
  );
};

export default TasksPage;
