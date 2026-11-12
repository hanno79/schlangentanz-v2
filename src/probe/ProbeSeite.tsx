import { useEffect, useState } from 'react'
import { geraeteklasseFuer } from './geraeteklasse'

function miss() {
  return { breite: window.innerWidth, touch: window.matchMedia('(pointer: coarse)').matches }
}

/** Seite unter `/probe`: zeigt, in welcher Geräteklasse die App gerade läuft (PROBE-1). */
export function ProbeSeite() {
  const [messung, setzeMessung] = useState(miss)
  const [messungen, setzeMessungen] = useState(0)

  useEffect(() => {
    const beiGroessenaenderung = () => setzeMessung(miss())
    window.addEventListener('resize', beiGroessenaenderung)
    return () => window.removeEventListener('resize', beiGroessenaenderung)
  }, [])

  const neuMessen = () => {
    setzeMessung(miss())
    setzeMessungen((anzahl) => anzahl + 1)
  }

  return (
    // Eigene Farben, weil die globalen Stile der App dunkle Schrift auf dunklem Grund ergäben.
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        padding: '1.5rem',
        lineHeight: 1.6,
        minHeight: '100vh',
        boxSizing: 'border-box',
        background: '#ffffff',
        color: '#1a1a1a',
        textAlign: 'left',
      }}
    >
      <h1>Probe-Seite</h1>
      <p>Geräteklasse: {geraeteklasseFuer(messung.breite)}</p>
      <p>Touch: {messung.touch ? 'ja' : 'nein'}</p>
      <p>Breite: {messung.breite} px</p>
      <button type="button" onClick={neuMessen} style={{ fontSize: '1.1rem', padding: '0.6rem 1.2rem' }}>
        Neu messen
      </button>
      <p>Messungen: {messungen}</p>
    </main>
  )
}
