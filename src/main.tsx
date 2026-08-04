import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { starteFehlerdienst } from './fehlerdienst.ts'

/* Vor `createRoot`, damit auch ein Fehler beim ersten Zeichnen erfasst wird.
   Ohne `VITE_SENTRY_DSN` tut der Aufruf nichts (siehe `fehlerdienst.ts`). */
starteFehlerdienst()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
