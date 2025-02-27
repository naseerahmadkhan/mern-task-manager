import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasksPaginated, createTask, updateTask, deleteTask, searchTasks, filterTasks, clearSearch } from '../../redux/taskSlice';
import { logout } from '../../redux/authSlice';
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Checkbox, Pagination, FormControlLabel, Switch
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Delete, Edit } from '@mui/icons-material';

function Tasks() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const dispatch = useDispatch();
  const { paginated, tasks, searchResults, loading, error } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasksPaginated({ page: 1, limit: 5 }));
  }, [dispatch]);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskData = { title, description };
    if (editId) {
      await dispatch(updateTask({ id: editId, task: taskData }));
      setEditId(null);
    } else {
      await dispatch(createTask(taskData));
    }
    setTitle('');
    setDescription('');
    if (searchQuery) {
      dispatch(searchTasks(searchQuery));
    } else {
      dispatch(fetchTasksPaginated({ page: paginated.currentPage, limit: 5 }));
    }
  };

  const handleEdit = (task) => {
    setEditId(task._id);
    setTitle(task.title);
    setDescription(task.description || '');
  };

  const handlePageChange = (event, value) => {
    dispatch(fetchTasksPaginated({ page: value, limit: 5 }));
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchTasks(searchQuery.trim()));
    } else {
      dispatch(clearSearch());
      dispatch(fetchTasksPaginated({ page: 1, limit: 5 }));
    }
  };

  const handleFilter = () => {
    setShowCompleted(!showCompleted);
    dispatch(filterTasks(!showCompleted));
  };

  const handleComplete = async (task) => {
    await dispatch(updateTask({ 
      id: task._id, 
      task: { completed: !task.completed } 
    }));
    if (searchQuery) {
      dispatch(searchTasks(searchQuery));
    }
  };

  const displayedTasks = searchQuery ? searchResults : paginated.tasks;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant='h4'>Task Manager</Typography>
        <Button variant='outlined' onClick={() => dispatch(logout())}>Logout</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <form onSubmit={handleSubmit}>
            <TextField
              label='Task Title'
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label='Description'
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button type='submit' variant='contained' fullWidth disabled={loading}>
              {editId ? 'Update Task' : 'Add Task'}
            </Button>
          </form>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label='Search Tasks'
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ mb: 2 }}
          />
          <Button variant='contained' fullWidth onClick={handleSearch} disabled={loading}>
            Search
          </Button>
          <FormControlLabel
            control={<Switch checked={showCompleted} onChange={handleFilter} />}
            label='Show Completed'
            sx={{ mt: 2 }}
          />
        </Grid>
      </Grid>
      {error && <Typography color='error' sx={{ mb: 2 }}>{error}</Typography>}
      {loading && <Typography>Loading...</Typography>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Completed</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedTasks.map((task) => (
            <TableRow key={task._id}>
              <TableCell>{task.title}</TableCell>
              <TableCell>{task.description}</TableCell>
              <TableCell>
                <Checkbox
                  checked={task.completed}
                  onChange={() => handleComplete(task)}
                  disabled={loading}
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(task)} disabled={loading}><Edit /></IconButton>
                <IconButton onClick={() => dispatch(deleteTask(task._id))} disabled={loading}><Delete /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!searchQuery && (
        <Pagination
          count={paginated.totalPages}
          page={paginated.currentPage}
          onChange={handlePageChange}
          sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
          disabled={loading}
        />
      )}
    </Box>
  );
}

export default Tasks;
