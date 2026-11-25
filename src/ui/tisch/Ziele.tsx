import type { ReactNode } from 'react'
import { wahlSchluessel } from '../spiel/auswahl'
import type { Wahl } from '../spiel/auswahl'
import { useZiele, zielDerArt } from './bedienung'
import { ZIELNAME } from './zugtexte'

/*
Die Ziele am Tisch (Plan O5, DESIGN.md „Angebotenes Ziel“). Der Tisch legt die
Bedienung in einen Kontext (`ZielKontext` in bedienung.ts); Schlangen, Gegner, Hand und Zugleiste fragen dort,
welche Wahlen bei ihnen als Ziel stehen, und zeichnen dafür einen Knopf. Die
Wahlen selbst kommen aus `auswahl`, also aus den Aktionen der Engine (U3); hier
wird nur gezeigt und angetippt.

Ein angebotenes Ziel trägt `data-ziel` mit dem Schlüssel seiner Wahl; daran
erkennen es Tests und das Zeichen „geht weiter“. Ein schon gewähltes Ziel
bleibt als gedrückter Knopf stehen, damit man es wieder abwählen kann. Jedes
Bedienelement, das eine Wahl trifft, trägt zudem `data-wahl`, auch eine
Handkarte; daran findet der Vertrag „hängt nie fest“ (O10) den Weg einer
Aktion.
*/

interface ZielKnopfEigenschaften {
  wahl: Wahl
  name: string
  /** Die Form des Ziels, etwa `st-ziel--ende`. */
  klasse: string
  children?: ReactNode
}

/** Ein angebotenes oder gewähltes Ziel als Knopf; gewählt ist er gedrückt. */
export function ZielKnopf({ wahl, name, klasse, children }: ZielKnopfEigenschaften) {
  const bedienung = useZiele()
  if (bedienung === null) return null
  return (
    <button
      type="button"
      className={`st-ziel ${klasse}`}
      data-ziel={bedienung.angeboten(wahl) ? wahlSchluessel(wahl) : undefined}
      data-wahl={wahlSchluessel(wahl)}
      aria-label={name}
      aria-pressed={bedienung.gewaehlt(wahl)}
      onClick={() => bedienung.tippe(wahl)}
    >
      {children}
    </button>
  )
}

/** „Neue Schlange“ neben dem Titel deiner Schlangen, wenn eine Farbkarte oder der Farbendieb sie anbietet. */
export function NeueSchlangeZiel() {
  const wahl = zielDerArt(useZiele()?.ziele ?? [], 'neueSchlange')
  if (wahl === undefined) return null
  return (
    <ZielKnopf wahl={wahl} name={ZIELNAME.neueSchlange} klasse="st-ziel--neu">
      <span aria-hidden="true">+ {ZIELNAME.neueSchlange}</span>
    </ZielKnopf>
  )
}

/** „KI-Gegner 1 wählen“ im Kopf eines Gegners, wenn eine Schlangengrube ihn anbietet. */
export function SpielerZiel({ spielerId, name }: { spielerId: string; name: string }) {
  const wahl = zielDerArt(useZiele()?.ziele ?? [], 'spieler', (ziel) => ziel.spielerId === spielerId)
  if (wahl === undefined) return null
  return (
    <ZielKnopf wahl={wahl} name={ZIELNAME.spieler(name)} klasse="st-ziel--spieler">
      <span aria-hidden="true">Wählen</span>
    </ZielKnopf>
  )
}
