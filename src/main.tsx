import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import Analytics from './components/Analytics'

createRoot(document.getElementById("root")!).render(
  <>
    <Analytics />
    <App />
  </>
);
