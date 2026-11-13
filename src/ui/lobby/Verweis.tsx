import type { MouseEvent, ReactNode } from 'react'
import { PFAD, geheZu, type Seite } from './navigation'

interface VerweisProps {
  ziel: Seite
  className?: string
  children: ReactNode
}

/**
 * Ein echter Link auf eine Seite der App: Er trägt die Adresse in `href`, damit
 * „in neuem Tab öffnen“ geht, und wechselt beim einfachen Klick ohne Neuladen.
 */
export default function Verweis({ ziel, className = 'verweis', children }: VerweisProps) {
  function beiKlick(ereignis: MouseEvent<HTMLAnchorElement>) {
    // Mit Zusatztaste oder mittlerer Maustaste entscheidet der Browser (neuer Tab, neues Fenster).
    if (ereignis.button !== 0 || ereignis.metaKey || ereignis.ctrlKey || ereignis.shiftKey || ereignis.altKey) return
    ereignis.preventDefault()
    geheZu(ziel)
  }

  return (
    <a href={PFAD[ziel]} className={className} onClick={beiKlick}>
      {children}
    </a>
  )
}
