import { fireEvent, render, screen, within } from '@testing-library/react'
import App from '../../../App'
import { anwendeAktion, ermittleAktionen, serialisiere } from '../../../engine'
import type { SpielAktion, Spielkarte, Spielzustand } from '../../../engine'
import { speichereSpielstand } from '../../../spielstand'
import { kartenname } from '../../karten/kartentexte'
import { roh } from '../../spiel/__tests__/steuerung'
import { auswahlstand, wahlSchluessel } from '../../spiel/auswahl'
import type { Wahl } from '../../spiel/auswahl'

/*
Hilfen für die Tests von O5: eine Partie unter `/spiel` öffnen, so wie die
Lobby sie hinterlässt, Karten und Ziele antippen und das Ergebnis mit dem
vergleichen, was die Engine aus derselben Aktion macht.

Die Erwartungen stehen hier unabhängig von der Oberfläche: Bedienbar sind in
O5 alle Aktionen der Engine ausser der Schlangenhäutung (O7) und der Abwehr
(O6).
*/

/** Öffnet `/spiel` mit diesem Spielstand im Speicher. */
export function spieleAm(zustand: Spielzustand) {
  speichereSpielstand(zustand)
  window.history.pushState({}, '', '/spiel')
  return render(<App />)
}

/** Die Aktionen, die O5 bedienbar macht. */
export function bedienbar(zustand: Spielzustand): SpielAktion[] {
  return ermittleAktionen(zustand).filter((aktion) => aktion.typ !== 'SchlangenhaeutungSpielen' && aktion.typ !== 'Reagieren')
}

/** Was nach dieser Auswahl am Tisch als Ziel angeboten sein muss, als Schlüssel. */
export function erwarteteZiele(zustand: Spielzustand, auswahl: Wahl[]): string[] {
  return auswahlstand(bedienbar(zustand), auswahl).angebote.map(wahlSchluessel).sort()
}

/** Alle Ziele, die der Tisch gerade anbietet (`data-ziel`), ohne gesperrte. */
export function angeboteneZiele(): string[] {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('[data-ziel]'))
    .filter((knopf) => !knopf.disabled)
    .map((knopf) => knopf.getAttribute('data-ziel')!)
    .sort()
}

export const handRegion = () => within(screen.getByRole('region', { name: 'Deine Hand' }))
export const zugleiste = () => within(screen.getByRole('region', { name: 'Zugleiste' }))

/** Der Knopf einer Handkarte; bei gleichen Karten der `nummer`-te. */
export function handkarte(karte: Spielkarte | string, nummer = 0): HTMLButtonElement {
  const name = typeof karte === 'string' ? karte : kartenname(karte)
  return handRegion().getAllByRole<HTMLButtonElement>('button', { name })[nummer]
}

export const tippe = (element: HTMLElement) => fireEvent.click(element)

/** Tippt das Ziel mit diesem zugänglichen Namen an. */
export function tippeZiel(name: string | RegExp): void {
  tippe(screen.getByRole('button', { name }))
}

export const ausfuehren = () => tippe(zugleiste().getByRole('button', { name: 'Ausführen' }))

/** Ob im Speicher genau der Stand steht, den die Engine aus `aktion` macht. */
export function gespieltWurde(start: Spielzustand, aktion: SpielAktion): boolean {
  return roh() === serialisiere(anwendeAktion(start, aktion).zustand)
}

/** Die eine aufgezählte Aktion, auf die `passt` zutrifft; wirft, wenn es nicht genau eine ist. */
export function aktionMit(zustand: Spielzustand, passt: (aktion: SpielAktion) => boolean): SpielAktion {
  const treffer = ermittleAktionen(zustand).filter(passt)
  if (treffer.length !== 1) throw new Error(`Erwartet genau eine passende Aktion, gefunden ${treffer.length}.`)
  return treffer[0]
}
