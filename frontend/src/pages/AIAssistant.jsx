import React, { useState, useEffect } from 'react';
import { useRateLimitStore } from '../store/rateLimitStore.js';
import { useCategorizeMutation, useInsightsMutation } from '../hooks/useAIBackend.ts';
import { AIHistoryService } from '../services/localDatabase.ts';

// Lightweight tag pill component
const Tag = ({ children }) => (
  <span style={{
    background: '#eef2ff',
    color: '#3730a3',
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '0.7rem',
    fontWeight: 500,
    letterSpacing: '.5px'
  }}>{children}</span>
);

const HistoryItem = ({ item, onRerun, onDelete }) => (
  <div style={{
    border: '1px solid #e5e7eb',
    padding: '0.5rem .75rem',
    borderRadius: 8,
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '.35rem'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <strong style={{ fontSize: '.75rem', color: '#555' }}>{item.mode.toUpperCase()}</strong>
      <div style={{ display: 'flex', gap: '.4rem' }}>
        <button onClick={() => onRerun(item)} style={{ fontSize: '.65rem' }}>Re-run</button>
        <button onClick={() => onDelete(item.id)} style={{ fontSize: '.65rem', color: '#dc2626' }}>✕</button>
      </div>
    </div>
    <div style={{ fontSize: '.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#444' }}>{item.input}</div>
    {item.category && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
        <Tag>{item.category}</Tag>
        {item.tags?.slice(0,3).map(t => <Tag key={t}>{t}</Tag>)}
      </div>
    )}
    {item.insights && (
      <div style={{ fontSize: '.6rem', color: '#555' }}>
        {item.insights.slice(0,2).map(i => <div key={i.key}>{i.key}: {Math.round(i.score*100)}%</div>)}
      </div>
    )}
    <div style={{ fontSize: '.55rem', color: '#777' }}>{new Date(item.createdAt).toLocaleTimeString()}</div>
  </div>
);

export function AIAssistant() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('categorize');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [cooldownUntil, setCooldownUntil] = useState(null); // Date
  const { limit, remaining, reset } = useRateLimitStore();
  const categorizeMutation = useCategorizeMutation();
  const insightsMutation = useInsightsMutation();

  const loading = categorizeMutation.isPending || insightsMutation.isPending;

  const refreshHistory = async () => {
    const h = await AIHistoryService.recent(50);
    setHistory(h);
  };
  useEffect(() => { refreshHistory(); }, []);

  const handleRateLimit = (err) => {
    if (!err?.response) return false;
    if (err.response.status === 429) {
      const retryAfter = parseInt(err.response.headers['retry-after'] || '0', 10);
      const resetUnix = parseInt(err.response.headers['x-ratelimit-reset'] || '0', 10);
      let until;
      if (resetUnix) {
        until = new Date(resetUnix * 1000);
      } else if (retryAfter > 0) {
        until = new Date(Date.now() + retryAfter * 1000);
      } else {
        until = new Date(Date.now() + 60 * 1000); // fallback 1m
      }
      setCooldownUntil(until);
      return true;
    }
    return false;
  };

  const run = async () => {
    setError(''); setResult(null);
    try {
      let r;
      if (mode === 'categorize') {
        r = await categorizeMutation.mutateAsync(text);
      } else {
        r = await insightsMutation.mutateAsync(text);
      }
      setResult(r);
      // Rate limit headers (remaining etc.) could be surfaced in UI later if desired
      // Persist history
      const record = mode === 'categorize' ? {
        mode: 'categorize',
        input: text,
        category: r.category,
        tags: r.tags,
        confidence: r.confidence,
        latencyMs: r.latencyMs
      } : {
        mode: 'insights',
        input: text,
        insights: r.insights,
        latencyMs: r.latencyMs
      };
      await AIHistoryService.recordQuery({ ...record });
      refreshHistory();
    } catch (e) {
      if (!handleRateLimit(e)) {
        setError(e?.message || 'Request failed');
      } else {
        setError('Rate limit reached. Cooling down…');
      }
    }
  };

  const remainingCooldownMs = cooldownUntil ? cooldownUntil.getTime() - Date.now() : 0;
  const windowResetMs = typeof reset === 'number' && reset > 0 ? Math.max(0, reset * 1000 - Date.now()) : null;
  useEffect(() => {
    if (!cooldownUntil) return;
    const id = setInterval(() => {
      if (Date.now() >= cooldownUntil.getTime()) {
        setCooldownUntil(null);
      } else {
        // trigger re-render
        setCooldownUntil(new Date(cooldownUntil.getTime()));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const rerunFromHistory = (item) => {
    setMode(item.mode);
    setText(item.input);
    setTimeout(() => run(), 0);
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  };

  const deleteHistoryItem = async (id) => { await AIHistoryService.delete(id); refreshHistory(); };
  const clearHistory = async () => { await AIHistoryService.clear(); refreshHistory(); };

  return (
    <div style={{ maxWidth: 1080, margin: '2rem auto', padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem' }}>
      <h1>AI Assistant</h1>
      <p style={{ color: '#666', gridColumn: '1 / span 2' }}>Experimental deterministic backend endpoints for quick categorization & insights.</p>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <select value={mode} onChange={e => setMode(e.target.value)} aria-label="Mode">
          <option value="categorize">Categorize</option>
            <option value="insights">Insights</option>
        </select>
        <button onClick={run} disabled={loading || !text.trim() || remainingCooldownMs > 0}>{loading ? 'Processing…' : 'Run'}</button>
        {result && <button onClick={copyResult} style={{ fontSize: '.75rem' }}>Copy Result</button>}
        {remainingCooldownMs > 0 && (
          <span style={{ fontSize: '.65rem', color: '#b45309' }}>Cooldown {Math.ceil(remainingCooldownMs/1000)}s</span>
        )}
        {remainingCooldownMs <= 0 && typeof remaining === 'number' && limit && windowResetMs !== null && (
          <span style={{ fontSize: '.65rem', color: '#2563eb' }}>
            {remaining}/{limit} left · resets in {Math.ceil(windowResetMs/1000)}s
          </span>
        )}
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={6}
        placeholder={mode === 'categorize' ? 'Enter text to categorize' : 'Enter content for insights'}
        style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.95rem', padding: '0.5rem' }}
      />
      {error && <div style={{ color: 'red', marginTop: '0.5rem' }}>{error}</div>}
      {result && (
        <div style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Result</h2>
          <pre style={{ background: '#111', color: '#eee', padding: '0.75rem', borderRadius: 6, overflowX: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
  <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#888' }}>Rate limit: 30 requests / 5 min per user. Remaining quota & window shown above.</p>
      {/* History Panel */}
      <div style={{ gridColumn: '2', gridRow: '1 / span 6', alignSelf: 'start' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
          <h2 style={{ fontSize: '.9rem', margin: 0 }}>History</h2>
          <button onClick={clearHistory} style={{ fontSize: '.6rem' }}>Clear</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
          {history.length === 0 && <div style={{ fontSize: '.65rem', color: '#666' }}>No history yet.</div>}
          {history.map(h => (
            <HistoryItem key={h.id} item={h} onRerun={rerunFromHistory} onDelete={deleteHistoryItem} />
          ))}
        </div>
      </div>
    </div>
  );
}
