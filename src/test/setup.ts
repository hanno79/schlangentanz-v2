import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { dialogNachbilden } from './dialog'

// O9: jsdom kennt `showModal()` nicht; Komponenten mit `<dialog>` (Grossansicht) brauchen es in jedem Test.
if (typeof HTMLDialogElement !== 'undefined' && typeof HTMLDialogElement.prototype.showModal !== 'function') {
  dialogNachbilden()
}

// O3: jsdom kennt `matchMedia` nicht. Ohne Angabe meldet es nichts als zutreffend, also auch kein „weniger Bewegung“;
// Tests, die eine Einstellung brauchen, ersetzen es mit `vi.stubGlobal`.
if (typeof document !== 'undefined' && typeof globalThis.matchMedia !== 'function') {
  globalThis.matchMedia = (abfrage: string): MediaQueryList => ({
    matches: false,
    media: abfrage,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}

// O11: jsdom kennt kein Layout und deshalb kein `scrollIntoView`; der Tisch scrollt damit ein Element, das die
// Tastatur geholt hat, ins Bild (src/ui/tisch/fokus.ts). Ohne Layout gibt es nichts zu scrollen.
if (typeof Element !== 'undefined' && typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = () => {}
}

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
// ÄNDERUNG [03.08.2026]: Dasselbe Problem, zweiter Fall. Seit die Partie in
// `localStorage` überlebt, schreibt jeder Test, der `usePartie` rendert, einen
// Spielstand weg. Ohne Aufräumen lädt der nächste Test ohne `initialZustand`
// die Partie des vorigen — und die Suite hinge davon ab, in welcher Reihenfolge
// sie läuft. Genau die Sorte Fehler, deretwegen es diese Datei gibt.
declare const window: {
  history: { pushState: (data: unknown, unused: string, url?: string | null) => void }
  localStorage?: { clear: () => void }
} | undefined
afterEach(() => {
  if (typeof window === 'undefined') return
  if (window.history) {
    try {
      window.history.pushState({}, '', '/')
    } catch {
      /* ignore */
    }
  }
  try {
    window.localStorage?.clear()
  } catch {
    /* ignore */
  }
})
