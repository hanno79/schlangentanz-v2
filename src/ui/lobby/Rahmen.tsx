import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface RahmenProps {
  testId: string
  /** Zusätzliche Klasse am Rahmen, etwa für die eigene Anordnung der Lobby. */
  klasse?: string
  /** Bild über dem Titel, etwa das Logo in der Lobby. */
  bild?: ReactNode
  titel: string
  text?: string
  /** Unter dem Text im Kopf, etwa der Verweis auf die Regeln in der Lobby. */
  kopfZusatz?: ReactNode
  /** Verweise am Fuss der Seite, etwa zurück zur Lobby. */
  fuss?: ReactNode
  /** Setzt beim Öffnen den Fokus auf den Titel, etwa wenn die Seite den Tisch ersetzt, auf dem der Fokus stand (O11 K1). */
  fokusAufTitel?: boolean
  children?: ReactNode
}

/** Das gemeinsame Gerüst jeder Seite des App-Rahmens: Titel, Einleitung, Inhalt, Fuss. */
export default function Rahmen({ testId, klasse, bild, titel, text, kopfZusatz, fuss, fokusAufTitel = false, children }: RahmenProps) {
  const titelRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (fokusAufTitel) titelRef.current?.focus()
  }, [fokusAufTitel])
  return (
    <main className={klasse === undefined ? 'rahmen' : `rahmen ${klasse}`} data-testid={testId}>
      <header className="rahmen__kopf">
        {bild}
        <h1 ref={titelRef} className="rahmen__titel" tabIndex={fokusAufTitel ? -1 : undefined}>
          {titel}
        </h1>
        {text !== undefined && <p className="rahmen__text">{text}</p>}
        {kopfZusatz}
      </header>
      {children}
      {fuss !== undefined && <nav className="rahmen__fuss">{fuss}</nav>}
    </main>
  )
}
