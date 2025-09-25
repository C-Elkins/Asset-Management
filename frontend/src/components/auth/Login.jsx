import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../services/api.js';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/status-indicator.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../app/store/authStore.ts';
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
      try { sessionStorage.setItem('E2E', '1'); } catch {}
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
  const from = location.state?.from?.pathname || '/app';

  // E2E convenience: only auto-redirect when ?e2eAuto=1 is present (keeps ?e2e=1 for enabling form without redirect)
  useEffect(() => {
    if (isE2E) {
      const sp = new URLSearchParams(window.location.search);
      if (sp.has('e2eAuto')) {
        // Programmatic login with demo credentials; tests can route-mock the backend
        const t = setTimeout(async () => {
          try {
            await login({ username: 'admin', password: 'admin123' });
            navigate('/app', { replace: true });
          } catch {
            // If login mock not provided, just stay on login
          }
        }, 100);
        return () => clearTimeout(t);
      }
    }
  }, [isE2E, navigate, login]);
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
    setFormError('');
    setSubmitting(true);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container" aria-labelledby="login-heading">
      <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
        <h2 id="login-heading" style={{ position: 'relative', paddingRight: '6rem' }}>IT Asset Management Login</h2>
        <div className="status-indicator-container">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={backendStatus.state + backendStatus.message}
              initial={{ opacity: 0, y: -4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.9 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`status-chip status-${backendStatus.state}`}
              role="status" aria-live="polite"
            >
              <span className="status-dot" />
              <span className="status-text">{backendStatus.message}</span>
            </motion.div>
          </AnimatePresence>
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
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                disabled={submitting || (backendStatus.state === 'down' && !isE2E)}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="password-toggle"
                aria-label={showPassword ? 'Hide value' : 'Show value'}
                style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)' }}
              >
                {showPassword ? '🙈' : '👁️'}
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

        <details style={{ marginTop: '1rem' }}>
          <summary>Demo credentials</summary>
          <p><strong>Username:</strong> <code>admin</code></p>
          <p><strong>Password:</strong> <code>admin123</code></p>
        </details>
      </form>
    </div>
  );
};
