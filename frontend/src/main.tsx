import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './styles/variables.css';
import './styles/globals.css';
import './styles/components.css';
import './index.css';

// ---- Boot Diagnostics (temporary) ----
// These logs help trace a blank screen issue by confirming progressive milestones.
// Remove after issue is resolved.
const bootMark = (label: string, data?: any) => {
	try {
		console.log(`🟢 BOOT:${label}`, data ?? '');
	} catch {}
};
bootMark('script-loaded', { ts: Date.now(), location: window.location.href });

// Capture uncaught errors & promise rejections to surface silent failures.
declare global {
	interface Window { __HAS_GLOBAL_ERROR_HANDLERS__?: boolean }
}
if (!(window as any).__HAS_GLOBAL_ERROR_HANDLERS__) {
	(window as any).__HAS_GLOBAL_ERROR_HANDLERS__ = true;
	window.addEventListener('error', (e) => {
		console.error('🔴 GlobalError', e.error || e.message, e.filename, e.lineno, e.colno);
	});
	window.addEventListener('unhandledrejection', (e) => {
		console.error('🔴 UnhandledPromiseRejection', e.reason);
	});
	bootMark('global-handlers-registered');
}

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
const queryClient = new QueryClient();

// E2E helper hooks: only attach in Playwright or explicit E2E mode
(() => {
	try {
		const isPlaywright = typeof navigator !== 'undefined' && (/Playwright/i.test(navigator.userAgent || '') || (navigator as any).webdriver === true);
		const urlFlag = typeof window !== 'undefined' && window.location && /[?&](e2e|e2eAuto)=1/.test(window.location.search);
		const envFlag = typeof window !== 'undefined' && typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_E2E === '1';
		const persisted = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('E2E') === '1';
		if (isPlaywright || urlFlag || envFlag || persisted) {
			if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('E2E', '1');
			(window as any).__e2eLogin = (token = 'e2eAccess', refreshToken = 'e2eRefresh') => {
				try {
					sessionStorage.setItem('E2E', '1');
					localStorage.setItem('jwt_token', token);
					// Also seed persisted auth store so features depending on it keep working
					try {
						const raw = localStorage.getItem('auth-store');
						const data = raw ? JSON.parse(raw) : {};
						const payload = {
							state: {
								user: data?.state?.user || { username: 'admin', role: 'SUPER_ADMIN' },
								accessToken: token,
								refreshToken,
								isAuthenticated: true,
								expiresAt: Date.now() + 15 * 60 * 1000,
							},
						};
						localStorage.setItem('auth-store', JSON.stringify(payload));
					} catch {}
					// Soft navigate to app route; in SPA preview this is reliable
					window.history.pushState({}, '', '/app');
					// Trigger popstate navigation for React Router if needed
					window.dispatchEvent(new PopStateEvent('popstate'));
				} catch {}
			};
			(window as any).__e2eLogout = () => {
				try {
					localStorage.removeItem('jwt_token');
					window.history.pushState({}, '', '/login');
					window.dispatchEvent(new PopStateEvent('popstate'));
				} catch {}
			};
		}
	} catch {}
})();

root.render(
	<QueryClientProvider client={queryClient}>
		<App />
	</QueryClientProvider>
);
