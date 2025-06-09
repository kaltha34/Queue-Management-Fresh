import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotificationSound from './components/NotificationSound';
import ErrorBoundary from './components/ErrorBoundary';
import BackToTop from './components/BackToTop';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import Breadcrumbs from './components/Breadcrumbs';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { QueueProvider } from './context/QueueContext';
import { CustomThemeProvider } from './context/ThemeContext';

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
      <CustomThemeProvider>
        <AuthProvider>
          <QueueProvider>
            <Router>
              <Header />
              <main style={{ minHeight: 'calc(100vh - 130px)', padding: '20px 0' }}>
                <div className="container">
                  <Breadcrumbs />
                </div>
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
              <KeyboardShortcuts />
              <BackToTop />
            </Router>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <NotificationSound />
          </QueueProvider>
        </AuthProvider>
      </CustomThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
