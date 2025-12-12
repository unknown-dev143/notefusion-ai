import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../services/taskApiService';
import useTasks from '../hooks/useTasks';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Typography,
  Box,
  Chip,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Paper,
  Grid,
  FormControlLabel,
  Switch,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AlarmIcon from '@mui/icons-material/Alarm';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

const priorityColors = {
  low: 'info',
  medium: 'warning',
  high: 'error',
} as const;

const TaskList: React.FC = () => {
  const {
    tasks,
    isLoadingTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getTasksByStatus,
    getTasksByPriority,
    searchTasks,
  } = useTasks();

  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'completed_at'>>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: null,
    reminder_enabled: false,
    reminder_time: null,
    category: null,
    tags: [],
  });

  const [newTag, setNewTag] = useState('');
  const availableCategories = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Other'];
  const availableTags = ['Urgent', 'Important', 'Later', 'Follow up', 'Idea'];

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<{ status?: TaskStatus; priority?: TaskPriority }>({});
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    try {
      // Format dates for API
      const taskToCreate = {
        ...newTask,
        due_date: newTask.due_date ? format(new Date(newTask.due_date), 'yyyy-MM-dd') : null,
        reminder_time: newTask.reminder_enabled && newTask.reminder_time 
          ? format(new Date(newTask.reminder_time), "yyyy-MM-dd'T'HH:mm:ss")
          : null,
      };
      
      await createTask(taskToCreate);
      setNewTask({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        due_date: null,
        reminder_enabled: false,
        reminder_time: null,
        category: null,
        tags: [],
      });
      setNewTag('');
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newTask.tags?.includes(newTag.trim())) {
      setNewTask(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTask(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTaskStatus({ id: taskId, status });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTask({ ...task });
  };

  const saveEdit = async () => {
    if (!editingTaskId || !editingTask) return;
    
    try {
      await updateTask({ id: editingTaskId, taskData: editingTask });
      setEditingTaskId(null);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesStatus = !filter.status || task.status === filter.status;
    const matchesPriority = !filter.priority || task.priority === filter.priority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (isLoadingTasks) {
    return <Typography>Loading tasks...</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Tasks
        </Typography>
      </Box>
        
        {/* Search and Filter */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filter.status || ''}
              onChange={(e: SelectChangeEvent) => 
                setFilter({ ...filter, status: e.target.value as TaskStatus || undefined })
              }
              displayEmpty
              startAdornment={<FilterListIcon />}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filter.priority || ''}
              onChange={(e: SelectChangeEvent) => 
                setFilter({ ...filter, priority: e.target.value as TaskPriority || undefined })
              }
              displayEmpty
            >
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* Add Task Form */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Paper component="form" onSubmit={handleCreateTask} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  size="small"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <FormControl sx={{ minWidth: 120 }} size="small">
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={newTask.priority}
                      onChange={(e) => 
                        setNewTask({ ...newTask, priority: e.target.value as TaskPriority })
                      }
                      label="Priority"
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl sx={{ minWidth: 140 }} size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={newTask.category || ''}
                      onChange={(e) => 
                        setNewTask({ ...newTask, category: e.target.value as string })
                      }
                      label="Category"
                    >
                      {availableCategories.map(category => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <DatePicker
                    label="Due date"
                    value={newTask.due_date}
                    onChange={(date) => setNewTask({ ...newTask, due_date: date })}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { minWidth: 150 },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    disabled={!newTask.title.trim()}
                    sx={{ ml: 'auto' }}
                  >
                    Add
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Description"
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newTask.reminder_enabled || false}
                        onChange={(e) => setNewTask({ ...newTask, reminder_enabled: e.target.checked })}
                        size="small"
                      />
                    }
                    label="Set Reminder"
                  />

                  {newTask.reminder_enabled && (
                    <TimePicker
                      label="Reminder time"
                      value={newTask.reminder_time || null}
                      onChange={(time) => setNewTask({ ...newTask, reminder_time: time })}
                      slotProps={{
                        textField: {
                          size: 'small',
                          sx: { minWidth: 150 },
                        },
                      }}
                    />
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={availableTags}
                    value={newTask.tags || []}
                    onChange={(_, newValue) => {
                      setNewTask(prev => ({
                        ...prev,
                        tags: newValue
                      }));
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          key={option}
                          label={option}
                          size="small"
                          onDelete={() => handleRemoveTag(option)}
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Tags"
                        size="small"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newTag.trim()) {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {params.InputProps.endAdornment}
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={handleAddTag}
                                  edge="end"
                                  size="small"
                                  disabled={!newTag.trim()}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </InputAdornment>
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </LocalizationProvider>
      
      {/* Task List */}
      <List>
        {filteredTasks.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
            No tasks found. Add a new task to get started!
          </Typography>
        ) : (
          filteredTasks.map((task) => (
            <Paper key={task.id} elevation={1} sx={{ mb: 1 }}>
              <ListItem>
                <Checkbox
                  edge="start"
                  checked={task.status === 'completed'}
                  onChange={(e) => 
                    handleStatusChange(
                      task.id,
                      e.target.checked ? 'completed' : 'pending'
                    )
                  }
                  tabIndex={-1}
                  disableRipple
                />
                
                {editingTaskId === task.id && editingTask ? (
                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <TextField
                      fullWidth
                      value={editingTask.title}
                      onChange={(e) => 
                        setEditingTask({ ...editingTask, title: e.target.value })
                      }
                      size="small"
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={editingTask.description || ''}
                      onChange={(e) => 
                        setEditingTask({ ...editingTask, description: e.target.value })
                      }
                      size="small"
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={editingTask.status || 'pending'}
                          onChange={(e) => 
                            setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })
                          }
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="in_progress">In Progress</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={editingTask.priority || 'medium'}
                          onChange={(e) => 
                            setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })
                )}
              </Box>
              
              {task.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textDecoration:
                      task.status === 'completed' ? 'line-through' : 'none',
                    mb: 1,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {task.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {task.due_date && (
                  <Chip
                    icon={<EventIcon fontSize="small" />}
                    label={format(new Date(task.due_date), 'MMM d, yyyy')}
                    size="small"
                    variant="outlined"
                    color={new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'error' : 'default'}
                  />
                )}
                
                {task.reminder_enabled && task.reminder_time && (
                  <Chip
                    icon={<AlarmIcon fontSize="small" />}
                    label={format(new Date(task.reminder_time), 'MMM d, h:mm a')}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                )}
                
                {task.tags?.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    onDelete={() => {}}
                  />
                ))}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
              <IconButton
                size="small"
                onClick={() => {
                  setEditingTaskId(task.id);
                  setEditingTask(task);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDeleteTask(task.id)}
              >
                <DeleteIcon fontSize="small" color="error" />
              </IconButton>
            </Box>
          </Box>
        </ListItem>
      </Paper>
    ))
  )}
</List>
                    </>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            </Paper>
          ))
        )}
      </List>
    </Paper>
  );
};

export default TaskList;
