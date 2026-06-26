import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// M1dq (2026-06-26): Globale Test-Pollution-Praevention.
// Verschiedene Slices (M1dp, M1dq) muessen fuer ihre RED-Tests
// `window.history.pushState({}, '', '/game')` aufrufen, damit der
// gerenderte JSX-Tree der /game-Route entspricht. Vitest isoliert
// jsdom standardmaessig NICHT pro Test oder File, sodass die
// route-conditional Render-Logik (z.B. `!istGameRoute && <Debug />`)
// in anderen Test-Files andere Trees rendert und Pre-Existing-Tests
// scheitern, die auf den Default-Lobby-Tree angewiesen sind.
// Wir resetten `pathname` nach jedem Test auf `/` (Lobby-Default),
// damit die Tests file-uebergreifend stabil bleiben.
declare const window: {
  history: { pushState: (data: unknown, unused: string, url?: string | null) => void }
} | undefined
afterEach(() => {
  if (typeof window !== 'undefined' && window.history) {
    try {
      window.history.pushState({}, '', '/')
    } catch {
      /* ignore */
    }
  }
})
