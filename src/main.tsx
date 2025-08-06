import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import Analytics from './components/Analytics'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

console.log('Main.tsx loading...');

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <Analytics />
    <App />
  </ErrorBoundary>
);

console.log('Main.tsx rendered');
