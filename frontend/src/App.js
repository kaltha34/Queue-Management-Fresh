import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotificationSound from './components/NotificationSound';
import ErrorBoundary from './components/ErrorBoundary';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { QueueProvider } from './context/QueueContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/routing/PrivateRoute';
import MentorRoute from './components/routing/MentorRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TeamDetails from './pages/TeamDetails';
import QueueManagement from './pages/QueueManagement';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Theme is now managed by ThemeContext

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <QueueProvider>
            <Router>
              <Header />
              <main style={{ minHeight: 'calc(100vh - 130px)', padding: '20px 0' }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/team/:id" element={<TeamDetails />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } />
                  <Route path="/queue-management" element={
                    <MentorRoute>
                      <QueueManagement />
                    </MentorRoute>
                  } />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </Router>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <NotificationSound />
          </QueueProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
