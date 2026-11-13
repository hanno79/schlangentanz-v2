import type { ReactNode } from 'react'

interface RahmenProps {
  testId: string
  titel: string
  text?: string
  /** Verweise am Fuss der Seite, etwa zurück zur Lobby. */
  fuss: ReactNode
  children?: ReactNode
}

/** Das gemeinsame Gerüst jeder Seite des App-Rahmens: Titel, Einleitung, Inhalt, Fuss. */
export default function Rahmen({ testId, titel, text, fuss, children }: RahmenProps) {
  return (
    <main className="rahmen" data-testid={testId}>
      <header className="rahmen__kopf">
        <h1 className="rahmen__titel">{titel}</h1>
        {text !== undefined && <p className="rahmen__text">{text}</p>}
      </header>
      {children}
      <nav className="rahmen__fuss">{fuss}</nav>
    </main>
  )
}
