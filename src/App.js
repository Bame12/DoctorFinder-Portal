import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { initializeDatabase } from './firebase/initializeDb';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Import Firebase
import { auth } from './firebase/firebase';

// Import Components
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import DoctorList from './components/Doctors/DoctorList';
import AddDoctor from './components/Doctors/AddDoctor';
import EditDoctor from './components/Doctors/EditDoctor';
import Reports from './components/Reports/Reports';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
  },
});

function App() {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    const initDb = async () => {
      await initializeDatabase();
    };
    initDb();
  }, []);

  useEffect(() => {
    // Monitor auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('User is authenticated:', user.email);
      } else {
        console.log('User is not authenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
        <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
            }}
        >
          <CircularProgress />
        </Box>
    );
  }

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public Route */}
            <Route
                path="/login"
                element={!user ? <Login /> : <Navigate to="/" />}
            />

            {/* Protected Routes */}
            <Route
                path="/"
                element={user ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
                path="/doctors"
                element={user ? <DoctorList /> : <Navigate to="/login" />}
            />
            <Route
                path="/doctors/add"
                element={user ? <AddDoctor /> : <Navigate to="/login" />}
            />
            <Route
                path="/doctors/edit/:id"
                element={user ? <EditDoctor /> : <Navigate to="/login" />}
            />
            <Route
                path="/reports"
                element={user ? <Reports /> : <Navigate to="/login" />}
            />

            {/* Redirect any unmatched routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </ThemeProvider>
  );
}

export default App;