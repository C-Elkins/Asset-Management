import React, { useState, useEffect } from 'react';
import './App.css';
import { HomePage } from './pages/HomePage.jsx';
import { Login } from './components/auth/Login.jsx';
import { authService } from './services/authService.js';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
      setUser({ authenticated: true });
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      {user ? (
        <HomePage user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
