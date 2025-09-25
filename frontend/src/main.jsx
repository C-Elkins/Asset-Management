import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/variables.css';
import './styles/globals.css';
import './styles/components.css';
import './index.css';
// Single theme mode: no dynamic theme application

const container = document.getElementById('root');
const root = createRoot(container);
const queryClient = new QueryClient();

root.render(
	<QueryClientProvider client={queryClient}>
		<App />
	</QueryClientProvider>
);
