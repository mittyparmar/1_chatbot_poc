import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from '@shared-ui';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ForgotPassword } from './components/ForgotPassword';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <ConfigProvider>
      <Router>
        <div className="auth-app min-h-screen bg-gray-50 flex items-center justify-center">
          <Routes>
            <Route 
              path="/login" 
              element={<Login onAuthSuccess={() => setIsAuthenticated(true)} />} 
            />
            <Route 
              path="/register" 
              element={<Register onAuthSuccess={() => setIsAuthenticated(true)} />} 
            />
            <Route 
              path="/forgot-password" 
              element={<ForgotPassword />} 
            />
            <Route 
              path="/" 
              element={isAuthenticated ? <Navigate to="/chat" /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
};

export default App;