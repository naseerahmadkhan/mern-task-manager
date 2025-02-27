import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const apiFetch = async (url, options = {}) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error((await response.json()).message);
  return response.json();
};

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    return await apiFetch('/tasks');
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchTasksPaginated = createAsyncThunk('tasks/fetchTasksPaginated', async ({ page, limit }, { rejectWithValue }) => {
  try {
    return await apiFetch(`/tasks/paginated?page=${page}&limit=${limit}`);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const searchTasks = createAsyncThunk('tasks/searchTasks', async (query, { rejectWithValue }) => {
  try {
    return await apiFetch(`/tasks/search?q=${encodeURIComponent(query)}`);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const filterTasks = createAsyncThunk('tasks/filterTasks', async (completed, { rejectWithValue }) => {
  try {
    return await apiFetch(`/tasks/filter?completed=${completed}`);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const createTask = createAsyncThunk('tasks/createTask', async (task, { rejectWithValue }) => {
  try {
    return await apiFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateTask = createAsyncThunk('tasks/updateTask', async ({ id, task }, { rejectWithValue }) => {
  try {
    return await apiFetch(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id, { rejectWithValue }) => {
  try {
    await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    paginated: { tasks: [], currentPage: 1, totalPages: 1, totalTasks: 0 },
    loading: false,
    error: null,
    searchResults: [],
  },
  reducers: {
    clearSearch: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTasks.fulfilled, (state, action) => { state.loading = false; state.tasks = action.payload; })
      .addCase(fetchTasks.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchTasksPaginated.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTasksPaginated.fulfilled, (state, action) => { state.loading = false; state.paginated = action.payload; })
      .addCase(fetchTasksPaginated.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(searchTasks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(searchTasks.fulfilled, (state, action) => { 
        state.loading = false; 
        state.searchResults = action.payload;
      })
      .addCase(searchTasks.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(filterTasks.fulfilled, (state, action) => { state.loading = false; state.tasks = action.payload; })
      .addCase(createTask.fulfilled, (state, action) => { 
        state.tasks.push(action.payload);
        state.paginated.tasks.unshift(action.payload);
        state.paginated.totalTasks += 1;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        const paginatedIndex = state.paginated.tasks.findIndex(t => t._id === action.payload._id);
        const searchIndex = state.searchResults.findIndex(t => t._id === action.payload._id);
        if (index !== -1) state.tasks[index] = action.payload;
        if (paginatedIndex !== -1) state.paginated.tasks[paginatedIndex] = action.payload;
        if (searchIndex !== -1) state.searchResults[searchIndex] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
        state.paginated.tasks = state.paginated.tasks.filter(t => t._id !== action.payload);
        state.searchResults = state.searchResults.filter(t => t._id !== action.payload);
        state.paginated.totalTasks -= 1;
      });
  },
});

export const { clearSearch } = taskSlice.actions;
export default taskSlice.reducer;
