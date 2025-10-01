import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../services/api.js';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/status-indicator.css';
import { useLocation, useNavigate } from 'react-router-dom';
import FirstLoginPasswordChange from './FirstLoginPasswordChange.jsx';
import { useAuthStore } from '../../app/store/authStore';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  username: z.string().min(1, 'Username is required').max(64, 'Max 64 characters'),
  password: z.string().min(1, 'Password is required').max(128, 'Max 128 characters')
});

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [pendingUsername, setPendingUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [backendStatus, setBackendStatus] = useState({ state: 'checking', message: 'Checking…' });
  const lastHealthSuccessRef = useRef(null);
  // Pull login action early so hooks below can safely reference it
  const login = useAuthStore(s => s.login);
  const storeError = useAuthStore(s => s.error);
  const isE2E = (() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.has('e2e') || sp.has('e2eAuto')) return true;
      if (typeof navigator !== 'undefined' && (/Playwright/i.test(navigator.userAgent || '') || navigator.webdriver === true)) return true;
      if (import.meta?.env?.VITE_E2E === '1') return true;
      if (sessionStorage.getItem('E2E') === '1') return true;
    } catch { /* ignore */ }
    return false;
  })();

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
  } catch { /* swallow direct fallback errors */ }
      }
      setBackendStatus(prev => prev.state === 'up' ? prev : { state: 'down', message: 'Offline' });
  // authDebug removed
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
    if (isE2E) {
      // In E2E, avoid disabling the form due to backend health to allow route-mocked flows
      setBackendStatus({ state: 'up', message: 'Online' });
      return () => { cancelled = true; };
    }
    const wrapped = async () => { if (!cancelled) await performHealthCheck(); };
    wrapped(); // initial
    const id = setInterval(wrapped, 12000);
    return () => { cancelled = true; clearInterval(id); };
  }, [performHealthCheck, isE2E]);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/app/dashboard';

  // E2E auto-login removed for production
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { username: '', password: '' }
  });

  useEffect(() => { setFocus('username'); }, [setFocus]);

  const onSubmit = async (data) => {
    if (submitting || isSubmitting) return; // Prevent double submission
    
    setFormError('');
    setSubmitting(true);
    setMustChangePassword(false);
    
    try {
      console.log('🔐 [Login] Starting login process, navigating to:', from);
      await login(data);
      console.log('✅ [Login] Login successful, about to navigate to:', from);
      navigate(from, { replace: true });
      console.log('🚀 [Login] Navigation called with replace=true');
    } catch (err) {
      console.error('❌ [Login] Login failed:', err);
      // Detect must-change-password (403)
      if (err?.message?.toLowerCase().includes('password change required')) {
        setMustChangePassword(true);
        setPendingUsername(data.username);
        setFormError('');
      } else {
        setFormError(err.message || 'Authentication failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (mustChangePassword) {
    return <FirstLoginPasswordChange username={pendingUsername} onSuccess={() => { setMustChangePassword(false); setFormError('Password changed. Please log in.'); }} />;
  }

  return (
    <div className="login-container" aria-labelledby="login-heading">
      <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
        <div className="login-header">
          <h2 id="login-heading" className="login-title">
            {/* Monochrome glyph using currentColor for light/dark adaptability */}
            <svg
              className="brand-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Minimal asset/briefcase-like mark */}
              <rect x="3" y="7" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M9 7V6a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            IT Asset Management Login
          </h2>
          <div className="status-indicator-inline">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={backendStatus.state + backendStatus.message}
                initial={{ opacity: 0, y: -4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.9 }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: 0.12 }}
                className={`status-chip status-${backendStatus.state}`}
                role="status" aria-live="polite"
              >
                <span className="status-dot" />
                <span className="status-text">{backendStatus.message}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        {(formError || storeError) && (
          <div className="error-message" role="alert" aria-live="assertive">{formError || storeError}</div>
        )}

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className="sr-only">Login credentials</legend>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="Enter username"
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : undefined}
              disabled={submitting || (backendStatus.state === 'down' && !isE2E)}
              {...register('username')}
            />
            {errors.username && (
              <div id="username-error" className="field-error" role="alert">{errors.username.message}</div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                disabled={submitting || (backendStatus.state === 'down' && !isE2E)}
                // Add right padding so the toggle button doesn't cover the text caret
                style={{ paddingRight: '2.25rem' }}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '1.75rem',
                  width: '1.75rem',
                  padding: 0,
                  background: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  lineHeight: 0
                }}
              >
                {/* Compact eye/eye-off icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {/* Eye-off (when hidden) */}
                  <g style={{ display: showPassword ? 'none' : 'inline' }} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" y1="2" x2="22" y2="22"/>
                  </g>
                  {/* Eye (when shown) */}
                  <g style={{ display: showPassword ? 'inline' : 'none' }} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </g>
                </svg>
              </button>
            </div>
            {errors.password && (
              <div id="password-error" className="field-error" role="alert">{errors.password.message}</div>
            )}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting || submitting || (backendStatus.state === 'down' && !isE2E)}
          className="primary-btn"
          aria-disabled={isSubmitting || submitting || (backendStatus.state === 'down' && !isE2E)}
        >
          { (isSubmitting || submitting) ? 'Authenticating…' : (backendStatus.state === 'down' && !isE2E) ? 'Backend Offline' : 'Login' }
        </button>

         {/* Demo credentials UI removed for production */}
      </form>
    </div>
  );
};
