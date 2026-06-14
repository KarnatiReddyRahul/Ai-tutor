import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';

const apiUrl = import.meta.env.VITE_API_URL;
console.log(`[AI Tutor] API URL: ${apiUrl || 'NOT SET — requests will fail'}`);
console.log(`[AI Tutor] Groq key present: ${Boolean(import.meta.env.VITE_GROQ_API_KEY)}`);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
