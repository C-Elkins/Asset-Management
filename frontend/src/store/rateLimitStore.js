import { create } from 'zustand';

// Holds latest rate limit headers from backend so multiple components can react.
export const useRateLimitStore = create((set) => ({
  limit: null,
  remaining: null,
  reset: null, // unix epoch seconds
  lastUpdated: null,
  setFromHeaders: (headers) => set(() => {
    if (!headers) return {};
    const limit = parseInt(headers['x-ratelimit-limit'] || headers['X-RateLimit-Limit'] || '0', 10) || null;
    const remaining = parseInt(headers['x-ratelimit-remaining'] || headers['X-RateLimit-Remaining'] || '0', 10) || null;
    const reset = parseInt(headers['x-ratelimit-reset'] || headers['X-RateLimit-Reset'] || '0', 10) || null;
    return {
      limit,
      remaining,
      reset,
      lastUpdated: Date.now()
    };
  }),
  clear: () => set({ limit: null, remaining: null, reset: null, lastUpdated: null })
}));

export function computeResetMs(reset) {
  if (!reset) return null;
  const ms = reset * 1000 - Date.now();
  return ms < 0 ? 0 : ms;
}
