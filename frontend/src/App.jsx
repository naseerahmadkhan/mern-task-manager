import { Routes, Route, Link } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import Login from './pages/login';
import Register from './pages/register';
import Tasks from './pages/tasks';
import ProtectedRoute from './routes/ProtectedRoute';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            Task Manager
          </Typography>
          {!isAuthenticated && (
            <Button color='inherit' component={Link} to='/register'>Registration</Button>
          )}
          <Button color='inherit' component={Link} to='/'>Tasks</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Routes>
          <Route 
            path='/login' 
            element={isAuthenticated ? <Navigate to='/' /> : <Login />} 
          />
          <Route 
            path='/register' 
            element={isAuthenticated ? <Navigate to='/' /> : <Register />} 
          />
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
    </>
  );
}

export default App;
