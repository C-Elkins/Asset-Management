import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../services/api.js';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/status-indicator.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService.js';

export const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState({ state: 'checking', message: 'Checking…' });
  const lastHealthSuccessRef = useRef(null);

  // Robust health check with latency classification & fallback direct fetch
  const performHealthCheck = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const start = performance.now();
    try {
      const res = await api.get('/actuator/health', { signal: controller.signal });
      clearTimeout(timeout);
      const status = res?.data?.status;
      const latency = performance.now() - start;
      if (status === 'UP') {
        lastHealthSuccessRef.current = Date.now();
        setBackendStatus({ state: latency < 500 ? 'up' : 'warn', message: latency < 500 ? 'Online' : 'Stable' });
      } else {
        setBackendStatus({ state: 'warn', message: 'Degraded' });
      }
    } catch (err) {
      clearTimeout(timeout);
      const shouldFallback = !lastHealthSuccessRef.current || (Date.now() - lastHealthSuccessRef.current > 15000);
      if (shouldFallback) {
        try {
          const direct = await fetch('http://localhost:8080/api/v1/actuator/health', { headers: { 'Accept': 'application/json' } });
          if (direct.ok) {
            const json = await direct.json();
            if (json.status === 'UP') {
              lastHealthSuccessRef.current = Date.now();
              setBackendStatus({ state: 'up', message: 'Online' });
              return;
            }
          }
        } catch (_) { /* swallow direct fallback errors */ }
      }
      setBackendStatus(prev => prev.state === 'up' ? prev : { state: 'down', message: 'Offline' });
      if (process.env.NODE_ENV === 'development') {
        if (!window.__lastHealthLog || Date.now() - window.__lastHealthLog > 10000) {
          console.warn('[Health] Proxy health check failed:', err?.message);
          window.__lastHealthLog = Date.now();
        }
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const wrapped = async () => { if (!cancelled) await performHealthCheck(); };
    wrapped(); // initial
    const id = setInterval(wrapped, 12000);
    return () => { cancelled = true; clearInterval(id); };
  }, [performHealthCheck]);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/app';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!credentials.username.trim()) {
      setError('Please enter a username');
      setLoading(false);
      return;
    }

    if (!credentials.password.trim()) {
      setError('Please enter a password');
      setLoading(false);
      return;
    }

    const result = await authService.login(credentials.username, credentials.password);
    
    if (result.success) {
      onLogin(result.user);
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 style={{ position: 'relative', paddingRight: '6rem' }}>IT Asset Management Login</h2>
        <div className="status-indicator-container">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={backendStatus.state + backendStatus.message}
              initial={{ opacity: 0, y: -4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.9 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`status-chip status-${backendStatus.state}`}
            >
              <span className="status-dot" />
              <span className="status-text">{backendStatus.message}</span>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" disabled={loading || backendStatus.state === 'down'}>
          {loading ? 'Authenticating…' : backendStatus.state === 'down' ? 'Backend Offline' : 'Login'}
        </button>
        
        <div className="demo-credentials">
          <p>Demo credentials:</p>
          <p>Username: <code>admin</code> | Password: <code>admin123</code></p>
        </div>
      </form>
    </div>
  );
};
