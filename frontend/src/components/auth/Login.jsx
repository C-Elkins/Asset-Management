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
import GoogleLoginButton from './GoogleLoginButton.jsx';
import MicrosoftLoginButton from './MicrosoftLoginButton.jsx';

const loginSchema = z.object({
  username: z.string().min(1, 'Email is required').email('Please enter a valid email').max(64, 'Max 64 characters'),
  password: z.string().min(1, 'Password is required').max(128, 'Max 128 characters')
});

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [pendingUsername, _setPendingUsername] = useState('');
  const [backendStatus, setBackendStatus] = useState({ state: 'checking', message: 'Checking…' });
  const [logoutReason, setLogoutReason] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const lastHealthSuccessRef = useRef(null);
  // Pull login action early so hooks below can safely reference it
  const login = useAuthStore(s => s.login);
  const storeError = useAuthStore(s => s.error);
  const isDev = typeof import.meta !== 'undefined' && import.meta?.env?.MODE === 'development';
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

  // Robust health check: prefer lightweight /healthz (mail ignored) then fallback to full actuator
  const performHealthCheck = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const start = performance.now();
    try {
      // 1. Try lightweight readiness first
      let res;
      let usedHealthz = false;
      try {
        res = await api.get('/healthz', { signal: controller.signal });
        usedHealthz = true;
      } catch (primaryErr) {
        if (isDev) console.debug('[HealthCheck] /healthz failed, falling back to /actuator/health:', primaryErr?.message || primaryErr);
        res = await api.get('/actuator/health', { signal: controller.signal });
      }
      clearTimeout(timeout);
      const status = res?.data?.status;
      // Inspect component details (e.g., mail often DOWN in dev but shouldn't block login)
      const components = res?.data?.components || {};
      const mailStatus = components.mail?.status;
      const latency = performance.now() - start;
      // Determine effective status: treat overall DOWN due solely to mail component failure as 'DEGRADED'
      const nonCriticalOnly = status === 'DOWN' && mailStatus === 'DOWN' && Object.values(components).every(c => {
        if (!c || typeof c !== 'object') return true;
        if (c === components.mail) return true;
        return c.status === 'UP';
      });
      if (isDev) console.debug('[HealthCheck]', usedHealthz ? 'healthz' : 'actuator', 'status:', status, 'mail:', mailStatus, 'nonCriticalOnly:', nonCriticalOnly, 'latency(ms):', latency.toFixed(1));
      if (status === 'UP') {
        lastHealthSuccessRef.current = Date.now();
        setBackendStatus({ state: latency < 500 ? 'up' : 'warn', message: latency < 500 ? 'Online' : 'Stable' });
      } else if (nonCriticalOnly) {
        lastHealthSuccessRef.current = Date.now();
        setBackendStatus({ state: 'warn', message: 'Degraded' });
      } else {
        setBackendStatus({ state: 'down', message: 'Offline' });
      }
  } catch (err) {
      clearTimeout(timeout);
      if (isDev) console.warn('[HealthCheck] primary request failed:', err?.name || err?.message || err);
      // If we received a response (e.g., 503) with health JSON, treat as degraded if only mail is down
      const respData = err?.response?.data;
      if (respData && typeof respData === 'object') {
        try {
          const components = respData.components || {};
          const mailOnly = respData.status === 'DOWN' && components.mail?.status === 'DOWN' && Object.values(components).every(c => {
            if (!c || typeof c !== 'object') return true;
            if (c === components.mail) return true;
            return c.status === 'UP';
          });
          if (mailOnly) {
            if (isDev) console.debug('[HealthCheck] 503 with only mail DOWN -> degraded');
            lastHealthSuccessRef.current = Date.now();
            setBackendStatus({ state: 'warn', message: 'Degraded' });
            return;
          }
        } catch {/* ignore analysis errors */}
      }
      const shouldFallback = !lastHealthSuccessRef.current || (Date.now() - lastHealthSuccessRef.current > 15000);
      if (shouldFallback) {
        try {
          // Attempt direct /healthz first, then actuator if needed
          let direct = await fetch('/api/healthz', { headers: { 'Accept': 'application/json' } });
          if (!direct.ok) {
            direct = await fetch('/api/actuator/health', { headers: { 'Accept': 'application/json' } });
          }
          if (direct.ok) {
            const json = await direct.json();
            if (json.status === 'UP') {
              lastHealthSuccessRef.current = Date.now();
              setBackendStatus({ state: 'up', message: 'Online' });
              return;
            }
            // If fallback returns DOWN but reachable, treat as degraded
            if (json.status === 'DOWN') {
              if (isDev) console.debug('[HealthCheck] fallback reachable but DOWN -> marking degraded');
              setBackendStatus({ state: 'warn', message: 'Degraded' });
              return;
            }
          }
        } catch { /* swallow direct fallback errors */ }
      }
      setBackendStatus({ state: 'down', message: 'Offline' });
    }
  }, [isDev]);

  // Periodically check backend health
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

  // Clear localStorage if requested via URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('clear') === '1') {
      localStorage.clear();
    }
    // Show logout reason if present
    try {
      const reason = localStorage.getItem('logout_reason');
      if (reason) {
        setLogoutReason(reason);
        localStorage.removeItem('logout_reason');
      }
    } catch {}
  }, [location]);  // E2E auto-login removed for production
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { username: '', password: '' }
  });

  useEffect(() => { setFocus('username'); }, [setFocus]);

  const onSubmit = async (data) => {
    if (isDev) console.log('🚀 [Login] onSubmit called with data:', data);
    try {
      if (isDev) console.log('🔄 [Login] About to call login...');
      const result = await login(data);
      if (isDev) console.log('✅ [Login] Login returned result:', result);
      if (isDev) console.log('📍 [Login] About to navigate to:', from);
      navigate(from, { replace: true });
      if (isDev) console.log('✨ [Login] Navigation completed');
    } catch (error) {
      if (isDev) console.error('❌ [Login] Login failed with error:', error);
      setFormError(error.message || 'Login failed');
    }
  };

  if (mustChangePassword) {
    return <FirstLoginPasswordChange username={pendingUsername} onSuccess={() => { setMustChangePassword(false); setFormError('Password changed. Please log in.'); }} />;
  }

  return (
    <div className="login-container" aria-labelledby="login-heading">
      <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
        {!!logoutReason && (
          <div className="info-message" role="status" aria-live="polite" style={{ marginBottom: '0.75rem' }}>
            {logoutReason}
          </div>
        )}
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
            Asset Management by Krubles Login
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
                <span className="status-text">
                  {backendStatus.state === 'checking' ? 'Checking…' : backendStatus.message}
                </span>
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
            <label htmlFor="username">Email</label>
            <input
              id="username"
              type="email"
              autoComplete="email"
              placeholder="Enter email"
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : undefined}
              disabled={isSubmitting || (backendStatus.state === 'down' && !isE2E)}
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
                disabled={isSubmitting || (backendStatus.state === 'down' && !isE2E)}
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
          disabled={isSubmitting || googleLoading || microsoftLoading || (backendStatus.state === 'down' && !isE2E)}
          className="w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)' }}
          aria-disabled={isSubmitting || googleLoading || microsoftLoading || (backendStatus.state === 'down' && !isE2E)}
        >
          { isSubmitting ? 'Authenticating…' : (backendStatus.state === 'down' && !isE2E) ? 'Backend Offline' : backendStatus.state === 'warn' ? 'Login (Degraded)' : 'Login' }
        </button>

        {/* Divider */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          margin: '1.5rem 0',
          color: '#9ca3af',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
          <span style={{ padding: '0 1rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
        </div>

        {/* Google Sign-In Button */}
        <GoogleLoginButton
          disabled={isSubmitting || googleLoading || microsoftLoading || (backendStatus.state === 'down' && !isE2E)}
          onError={(error) => setFormError(error)}
          onLoading={setGoogleLoading}
        />

        {/* Microsoft Sign-In Button */}
        <div style={{ marginTop: '0.5rem' }}>
          <MicrosoftLoginButton
            disabled={isSubmitting || googleLoading || microsoftLoading || (backendStatus.state === 'down' && !isE2E)}
            onError={(error) => setFormError(error)}
            onLoading={setMicrosoftLoading}
          />
        </div>

        {/* Helper links */}
        <div className="login-links" style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <a href="/signup">Create account</a>
          <a href="/forgot-password">Forgot password?</a>
        </div>

        {/* MFA hint */}
        <div className="login-links" style={{ marginTop: '0.5rem', fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
          If your account has MFA enabled, you’ll enter a 6‑digit code after signing in.
        </div>

        {/* Marketing links */}
        <div className="login-links" style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: 12, color: '#6b7280' }}>
          <a href="/" title="Home">Home</a>
          <a href="/pricing" title="Pricing">Pricing</a>
          <a href="/about" title="About us">About</a>
        </div>

         {/* Demo credentials UI removed for production */}
      </form>
    </div>
  );
};
