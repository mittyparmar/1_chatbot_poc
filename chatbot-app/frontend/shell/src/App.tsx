import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import { ModuleLoader } from './components/ModuleLoader';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const location = useLocation();

  // Simulate authentication check
  useEffect(() => {
    // In a real app, this would check for valid tokens
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role') as 'user' | 'admin' || 'user';
    
    setIsAuthenticated(!!token);
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    setIsAuthenticated(false);
    setUserRole('user');
  };

  return (
    <div className="app-container">
      <Navigation
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        onLogout={handleLogout}
      />
      
      <main className="main-content">
        <Routes>
          <Route
            path="/auth"
            element={
              <ModuleLoader modulePath="auth" />
            }
          />
          <Route
            path="/chat"
            element={
              <ModuleLoader modulePath="chat" />
            }
          />
          <Route
            path="/admin"
            element={
              <ModuleLoader modulePath="admin" />
            }
          />
          <Route
            path="/profile"
            element={
              <ModuleLoader modulePath="profile" />
            }
          />
          <Route
            path="/"
            element={
              <div className="text-center py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to Chatbot Application
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Get started by navigating to one of the sections above
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
                    <p className="text-gray-600 text-sm">Manage your profile and preferences</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat</h3>
                    <p className="text-gray-600 text-sm">Start a conversation with our AI assistant</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin</h3>
                    <p className="text-gray-600 text-sm">Manage users and conversations</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
                    <p className="text-gray-600 text-sm">View usage statistics and insights</p>
                  </div>
                </div>
              </div>
            }
          />
          <Route
            path="*"
            element={
              <div className="text-center py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                <p className="text-lg text-gray-600 mb-8">
                  The page you're looking for doesn't exist.
                </p>
                <a
                  href="/"
                  className="btn-primary inline-flex items-center"
                >
                  Go to Home
                </a>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;