import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/variables.css';
import './styles/globals.css';
import './styles/components.css';
import './index.css';
import { applyTheme } from './utils/theme.js';

// Apply theme preference as early as possible to avoid flash
try { applyTheme(); } catch {}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
