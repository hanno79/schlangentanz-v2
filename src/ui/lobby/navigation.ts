import { useSyncExternalStore } from 'react'

/*
Die Seiten der App und der Wechsel zwischen ihnen, über die History-API des
Browsers und ohne Router-Bibliothek (U10).

Die Adresse ist globaler Zustand des Browsers, deshalb gibt es hier keinen
eigenen: `geheZu` legt einen Eintrag in den Verlauf und sagt es den Lesern,
Vor und Zurück des Browsers lösen `popstate` aus, und `useAdresse` liest in
beiden Fällen `location.pathname`. Wer wechseln will, ruft `geheZu`, ohne dass
es durch die Komponenten gereicht werden muss. Neu laden oder direkt aufrufen
geht, weil Server und Vercel jede Adresse auf `index.html` umleiten
(`vercel.json`).
*/

export type Seite = 'lobby' | 'spiel' | 'regeln'

export const PFAD: Record<Seite, string> = {
  lobby: '/',
  spiel: '/spiel',
  regeln: '/regeln',
}

/** Die Seite zu einem Pfad, ein Schrägstrich am Ende zählt nicht; `null`, wenn die App den Pfad nicht kennt. */
export function seiteZuPfad(pfad: string): Seite | null {
  const ohneSchraegstrich = pfad.replace(/\/+$/, '') || '/'
  const seiten = Object.keys(PFAD) as Seite[]
  return seiten.find((seite) => PFAD[seite] === ohneSchraegstrich) ?? null
}

/** Eigenes Ereignis für Wechsel aus der App; `pushState` selbst löst keines aus. */
const WECHSEL = 'schlangentanz:adresswechsel'

/** Wechselt auf eine Seite der App und legt dafür einen Eintrag in den Verlauf. */
export function geheZu(seite: Seite): void {
  const ziel = PFAD[seite]
  // Ein Wechsel auf die Seite, die schon offen ist, legt keinen doppelten Eintrag an.
  if (window.location.pathname !== ziel) window.history.pushState(null, '', ziel)
  window.dispatchEvent(new Event(WECHSEL))
}

function abonniere(melde: () => void): () => void {
  window.addEventListener('popstate', melde)
  window.addEventListener(WECHSEL, melde)
  return () => {
    window.removeEventListener('popstate', melde)
    window.removeEventListener(WECHSEL, melde)
  }
}

/** Der aktuelle Pfad; die Komponente zeichnet neu, sobald er sich ändert. */
export function useAdresse(): string {
  return useSyncExternalStore(abonniere, () => window.location.pathname)
}
