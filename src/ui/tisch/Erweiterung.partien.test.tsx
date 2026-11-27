import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider, erstellePartie } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { erzeugeZufall } from '../../engine/testing/zufall'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { wahlSchluessel, wegZu } from '../spiel/auswahl'
import type { Wahl } from '../spiel/auswahl'
import { vorschauFuer } from '../spiel/haeutungsvorschau'
import { tischAnsicht } from '../spiel/tischAnsicht'
import type { TischAnsicht } from '../spiel/tischAnsicht'
import { aktionMit } from './__tests__/bedienen'
import { Tisch } from './Tisch'

/*
O10 (Vorrang aus der Prüfung von X6): Mit Erweiterung hängt der Mensch nie
fest. Solange die Engine ihm Aktionen anbietet, führt er jede Art davon am
Tisch selbst aus, nur mit Antippen: In jeder Lage, in der er entscheidet,
wird je Aktionstyp eine zufällige Aktion über die Knöpfe des Tisches
gewählt, und „Ausführen“ (oder der Knopf, der sie direkt spielt) liefert
genau dieses Objekt der Engine (U3).

Jedes Bedienelement, das eine Wahl trifft, trägt `data-wahl` mit dem
Schlüssel dieser Wahl. Der Tausch des Schlangenkorbs nimmt zwei Tipps: erst
die Karte der Schlange (`data-tauschplatz`), dann die Handkarte. Von der
Schlangenhäutung prüft dieser Vertrag nur Karte und Schlange; Abschnitt und
Ordnen prüfen die Tests von O7.
*/

afterEach(cleanup)

/** Zeichnet den Tisch mit dieser Sicht; die Aktionen darin sind die Objekte, die „Ausführen“ liefern muss. */
function zeichne(zustand: Spielzustand, ansicht: TischAnsicht) {
  const fuehreAus = vi.fn<(aktion: SpielAktion) => void>()
  render(<Tisch ansicht={ansicht} fuehreAus={fuehreAus} ablehnung={null} haeutungsVorschau={vorschauFuer(zustand)} />)
  return fuehreAus
}

/** Das eine bedienbare Element für diese Wahl; ein gesperrtes zählt nicht. */
function elementFuer(wahl: Wahl): HTMLElement {
  switch (wahl.art) {
    case 'zugBeenden':
      return screen.getByRole('button', { name: 'Zug beenden' })
    case 'abwehren':
      return screen.getByRole('button', { name: 'Abwehren' })
    case 'durchlassen':
      return screen.getByRole('button', { name: 'Durchlassen' })
    default: {
      const treffer = Array.from(document.querySelectorAll<HTMLButtonElement>(`[data-wahl="${CSS.escape(wahlSchluessel(wahl))}"]`)).filter((knopf) => !knopf.disabled)
      if (treffer.length !== 1) throw new Error(`Für die Wahl ${wahlSchluessel(wahl)} gibt es ${treffer.length} bedienbare Elemente am Tisch, erwartet 1.`)
      return treffer[0]
    }
  }
}

/** Geht den Weg der Aktion am Tisch; liefert, ob er bis zum Ende ging (bei der Häutung nur bis zum Ordnen). */
function geheWeg(aktion: SpielAktion, art: string | null): 'ganz' | 'bis zum Ordnen' {
  const { folge, menge } = wegZu(aktion, art)
  for (const wahl of [...folge, ...menge]) {
    // Den Abschnitt wählt man mit zwei Tipps auf seine Enden, die Reihenfolge durch Tauschen (O7).
    if (wahl.art === 'abschnitt' || wahl.art === 'reihenfolge') return 'bis zum Ordnen'
    if (wahl.art === 'tausch') {
      const platz = document.querySelector<HTMLButtonElement>(`[data-tauschplatz="${CSS.escape(wahl.karteId)}"]`)
      if (platz === null || platz.disabled) throw new Error(`Für den Tausch von ${wahl.karteId} steht in der Schlange kein Knopf.`)
      fireEvent.click(platz)
    }
    fireEvent.click(elementFuer(wahl))
  }
  return 'ganz'
}

/** Drückt den Knopf, der die vollständige Auswahl spielt: „Ausführen“ in der Zugleiste oder „Ablegen“ im Dialog. */
function bestaetige(): void {
  const dialog = screen.queryByRole('dialog', { name: 'Zu viele Handkarten' })
  const ort = dialog === null ? within(screen.getByRole('region', { name: 'Zugleiste' })) : within(dialog)
  fireEvent.click(ort.getByRole('button', { name: dialog === null ? 'Ausführen' : 'Ablegen' }))
}

/** Je Aktionstyp eine zufällige Aktion. */
function jeTyp(aktionen: readonly SpielAktion[], zufall: () => number): SpielAktion[] {
  const typen = new Map<string, SpielAktion[]>()
  for (const aktion of aktionen) typen.set(aktion.typ, [...(typen.get(aktion.typ) ?? []), aktion])
  return [...typen.values()].map((liste) => liste[Math.floor(zufall() * liste.length)])
}

/** Spielt jede Art von Aktion des Menschen am Tisch; liefert die Typen, die ganz gespielt wurden. */
function pruefeLage(zustand: Spielzustand, zufall: () => number, name: string): string[] {
  const ansicht = tischAnsicht(zustand)
  const { aktionen } = ansicht
  expect(aktionen, `${name}: die Sicht nennt genau die Aktionen der Engine`).toEqual(ermittleAktionen(zustand))
  expect(aktionen.length, `${name}: die Engine bietet dir nichts an`).toBeGreaterThan(0)
  const gespielt: string[] = []
  for (const aktion of jeTyp(aktionen, zufall)) {
    const fuehreAus = zeichne(zustand, ansicht)
    const weg = geheWeg(aktion, ansicht.entscheidung?.art ?? null)
    if (weg === 'ganz') {
      if (fuehreAus.mock.calls.length === 0) bestaetige()
      expect(fuehreAus.mock.calls.map(([gespielteAktion]) => gespielteAktion), `${name}: ${aktion.typ}`).toEqual([aktion])
      expect(fuehreAus.mock.calls[0][0], `${name}: ${aktion.typ} ist nicht das Objekt der Engine`).toBe(aktion)
      gespielt.push(aktion.typ)
    }
    cleanup()
  }
  return gespielt
}

/** Eine Partie mit Erweiterung; die Engine wählt für alle, zuerst den Typ, dann die Aktion. */
function* lagenDesMenschen(saat: number, spielerzahl: number): Generator<Spielzustand> {
  const zufall = erzeugeZufall(saat * 31)
  let zustand = erstellePartie({ spielerzahl, erweiterung: true, zufall: erzeugeZufall(saat) })
  for (let schritt = 0; schritt < 3000 && zustand.partiephase !== 'Beendet'; schritt += 1) {
    if (ermittleEntscheider(zustand) === 0) yield zustand
    const aktionen = ermittleAktionen(zustand)
    const auswahl = jeTyp(aktionen, zufall)
    zustand = anwendeAktion(zustand, auswahl[Math.floor(zufall() * auswahl.length)]).zustand
  }
  expect(zustand.partiephase, `Partie aus Saat ${saat} endet`).toBe('Beendet')
}

const ERWEITERUNGSTYPEN = ['ComebackEinsetzen', 'Entscheiden', 'RisikoKarteSpielen', 'SchlangenkorbSpielen', 'ZweiAbwerfenDreiZiehen']

describe('O10 (Vorrang): Mit Erweiterung hängt der Mensch nie fest', () => {
  it('O10/X6: in festen Lagen der Erweiterung spielt der Mensch jede angebotene Art von Aktion am Tisch', () => {
    const zufall = erzeugeZufall(10)
    const gespielt = new Set<string>()
    const lagen: [string, Spielzustand][] = ['korb-allein', 'korb-ziehen', 'korb-tauschen', 'korb-entfernen', 'korb-aktionen', 'comeback-bedingung', 'comeback-abwerfen-ziehen', 'risiko-erfolg', 'risiko-misserfolg', 'risiko-du-beguenstigt'].map(
      (name) => [name, erzeugeSzenario(name)],
    )
    // „Zwei Karten abwerfen, drei ziehen“ gibt es erst nach dem Einsatz der Comeback-Karte oder dem Bonus des Korbs (D46, D49).
    const comeback = erzeugeSzenario('comeback-abwerfen-ziehen')
    lagen.push(['comeback-abwerfen-ziehen nach dem Einsatz', anwendeAktion(comeback, aktionMit(comeback, (a) => a.typ === 'ComebackEinsetzen')).zustand])
    const korb = erzeugeSzenario('korb-aktionen')
    lagen.push(['korb-aktionen nach dem Bonus', anwendeAktion(korb, aktionMit(korb, (a) => a.typ === 'SchlangenkorbSpielen' && a.bonus.art === 'aktionen')).zustand])
    // Dazu jede Entscheidung, die eine Risiko-Aktion dem Spieler am Zug stellt.
    const risiko = erzeugeSzenario('risiko-erfolg')
    for (const aktion of ermittleAktionen(risiko).filter((a) => a.typ === 'RisikoKarteSpielen')) {
      lagen.push([`risiko-erfolg nach ${JSON.stringify(aktion)}`, anwendeAktion(risiko, aktion).zustand])
    }
    for (const [name, zustand] of lagen) {
      if (ermittleEntscheider(zustand) !== 0) continue
      for (const typ of pruefeLage(zustand, zufall, name)) gespielt.add(typ)
    }
    expect([...gespielt].filter((typ) => ERWEITERUNGSTYPEN.includes(typ)).sort()).toEqual(ERWEITERUNGSTYPEN)
  }, 60_000)

  it('O10/X6: in einer Zufallspartie mit 3 Spielern und Erweiterung spielt der Mensch in jeder Lage jede angebotene Art von Aktion am Tisch', () => {
    const zufall = erzeugeZufall(77)
    let lagen = 0
    const gespielt = new Set<string>()
    for (const zustand of lagenDesMenschen(5, 3)) {
      lagen += 1
      for (const typ of pruefeLage(zustand, zufall, `Saat 5, Lage ${lagen}`)) gespielt.add(typ)
    }
    expect(lagen, 'Lagen, in denen du entscheidest').toBeGreaterThan(20)
    expect(gespielt.has('SchlangenkorbSpielen') || gespielt.has('RisikoKarteSpielen'), 'die Partie hat Erweiterungsaktionen gespielt').toBe(true)
  }, 180_000)
})
