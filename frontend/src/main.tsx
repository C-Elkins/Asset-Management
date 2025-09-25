import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Minimal entry mounting the routed application (ensures /login exists for tests)
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
