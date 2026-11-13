import type { ReactNode } from 'react'
import { Karte } from '../../ui/karten/Karte'
import { kartenname } from '../../ui/karten/kartentexte'
import type { BeispielSchlange } from './beispiel'

/** Ein angebotenes Ziel: Kennung für die Auswahl, Beschreibung für die Zugleiste. */
export interface Ziel {
  id: string
  beschreibung: string
}

export interface Zielwahl {
  gewaehlt: string | null
  waehle: (ziel: Ziel) => void
}

interface SchlangeEigenschaften {
  schlange: BeispielSchlange
  /** „Mias Schlange 1“, „deine Schlange 2“ */
  titel: string
  /** Bietet die Enden der Schlange als Ziel an (Farbkarte gewählt). */
  endenAlsZiel: boolean
  /** Bietet jede Karte der Schlange als Ziel an (Farbendieb gewählt). */
  kartenAlsZiel: boolean
  zielwahl: Zielwahl
}

/**
 * Eine Schlange als Reihe von Karten, die bei Platzmangel umbricht statt die
 * Seite zu verbreitern. Karten einer Farbgruppe tragen einen Balken darunter.
 */
export function Schlange({ schlange, titel, endenAlsZiel, kartenAlsZiel, zielwahl }: SchlangeEigenschaften) {
  const ende = (seite: 'links' | 'rechts') => {
    const ziel = { id: `ende:${schlange.id}:${seite}`, beschreibung: `${seite} an ${titel}` }
    return (
      <li>
        <ZielKnopf ziel={ziel} zielwahl={zielwahl} klasse="ziel--ende" name={`${seite === 'links' ? 'Links' : 'Rechts'} an ${titel} anlegen`}>
          <span aria-hidden="true">+</span>
        </ZielKnopf>
      </li>
    )
  }

  return (
    <ol className="schlange" aria-label={`${titel}, ${schlange.karten.length} Karten`}>
      {endenAlsZiel && ende('links')}
      {schlange.karten.map(({ karte, gruppe }) => (
        <li key={karte.id} className={gruppe ? 'in-gruppe' : undefined}>
          {kartenAlsZiel ? (
            <ZielKnopf
              ziel={{ id: `karte:${karte.id}`, beschreibung: `${kartenname(karte)} aus ${titel}` }}
              zielwahl={zielwahl}
              klasse="ziel--karte"
              name={`${kartenname(karte)} aus ${titel}`}
            >
              <Karte karte={karte} />
            </ZielKnopf>
          ) : (
            <Karte karte={karte} />
          )}
        </li>
      ))}
      {endenAlsZiel && ende('rechts')}
    </ol>
  )
}

interface ZielKnopfEigenschaften {
  ziel: Ziel
  zielwahl: Zielwahl
  klasse: string
  name: string
  children: ReactNode
}

/** Ein Knopf, der ein angebotenes Ziel trägt; gewählt ist er gedrückt. */
export function ZielKnopf({ ziel, zielwahl, klasse, name, children }: ZielKnopfEigenschaften) {
  return (
    <button
      type="button"
      className={`ziel ${klasse}`}
      data-ziel={ziel.id}
      aria-label={name}
      aria-pressed={zielwahl.gewaehlt === ziel.id}
      onClick={() => zielwahl.waehle(ziel)}
    >
      {children}
    </button>
  )
}
