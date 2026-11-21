import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { anwendeAktion, berechneZwischenstand, ermittleAktionen, serialisiere } from '../../engine'
import type { SchlangenhaeutungSpielenAktion, SpielAktion, Spielzustand } from '../../engine'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { roh } from '../spiel/__tests__/steuerung'
import { vorschauFuer } from '../spiel/haeutungsvorschau'
import { tischAnsicht } from '../spiel/tischAnsicht'
import { aktionMit, angeboteneZiele, ausfuehren, erwarteteZiele, gespieltWurde, handkarte, spieleAm, tippe, tippeZiel, zugleiste } from './__tests__/bedienen'
import { Tisch } from './Tisch'

/*
O7: Schlangenhäutung am Tisch. Erst Schlange und Abschnitt wählen, angeboten nur
mit dem, was die Engine aufzählt; dann die Karten durch Antippen tauschen oder
mit den Pfeiltasten verschieben und bestätigen. Gespielt wird die aufgezählte
Aktion, deren Farbfolge der gezeigten Anordnung gleicht.
*/

const HAEUTUNG = 'Sonderkarte Schlangenhäutung'
const istHaeutung = (aktion: SpielAktion): aktion is SchlangenhaeutungSpielenAktion => aktion.typ === 'SchlangenhaeutungSpielen'

/** Der Knopf der Karte an Stelle `nummer` (ab 1) einer Schlange. */
const karteIn = (titel: string, nummer: number) => screen.getByRole('button', { name: new RegExp(`^${titel}, Karte ${nummer}:`) })

/** Die Stellen (ab 1) der Karten einer Schlange, die gerade als Ziel angeboten sind. */
function angeboteneKarten(titel: string): number[] {
  return screen
    .queryAllByRole('button', { name: new RegExp(`^${titel}, Karte \\d+:`) })
    .filter((knopf) => knopf.hasAttribute('data-ziel'))
    .map((knopf) => Number(/Karte (\d+):/.exec(knopf.getAttribute('aria-label')!)![1]))
}

/** Die Farben, die eine Schlange am Tisch zeigt, von vorn nach hinten. */
function gezeigteFarben(titel: string): string[] {
  const liste = screen.getByRole('list', { name: new RegExp(`^${titel}:`) })
  return Array.from(liste.querySelectorAll('img')).map((bild) => bild.alt.replace(/^Farbkarte (\S+),.*$/, '$1'))
}

function waehleAbschnitt(titel: string, von: number, bis: number): void {
  tippe(handkarte(HAEUTUNG))
  tippeZiel(`${titel} wählen`)
  tippe(karteIn(titel, von))
  tippe(karteIn(titel, bis))
}

function tausche(titel: string, a: number, b: number): void {
  tippe(karteIn(titel, a))
  tippe(karteIn(titel, b))
}

/** Die aufgezählte Häutung, die diese Schlange in diese Farbfolge bringt, für die Stellen `von` bis `bis` (ab 1). */
function haeutungZu(zustand: Spielzustand, schlangenId: string, von: number, farben: string[]): SchlangenhaeutungSpielenAktion {
  const karten = zustand.spieler.flatMap((spieler) => spieler.schlangen).find((schlange) => schlange.id === schlangenId)!.karten
  const farbe = (id: string) => {
    const karte = karten.find((eintrag) => eintrag.id === id)!
    return karte.typ === 'Farbkarte' ? karte.farbe : karte.name
  }
  const aktion = aktionMit(
    zustand,
    (a) =>
      istHaeutung(a) &&
      a.schlangenId === schlangenId &&
      a.neueReihenfolge.map(farbe).join() === farben.join() &&
      Math.min(...a.neueReihenfolge.map((id) => karten.findIndex((karte) => karte.id === id))) === von - 1,
  )
  return aktion as SchlangenhaeutungSpielenAktion
}

describe('O7 K1/K2: Schlange und Abschnitt wählen', () => {
  it('O7 K2/A7.9: nach der Karte die Schlangen der Engine, nach der Schlange genau die Enden ihrer Abschnitte', () => {
    const start = erzeugeSzenario('haeutung')
    spieleAm(start)
    const karteId = start.spieler[0].hand[0].id
    tippe(handkarte(HAEUTUNG))
    expect(angeboteneZiele()).toEqual(erwarteteZiele(start, [{ art: 'karte', karteId }]))
    expect(zugleiste().getByText('Wähle die Schlange.')).toBeInTheDocument()
    tippeZiel('Deine Schlange 1 wählen')
    const ids = start.spieler[0].schlangen[0].karten.map((karte) => karte.id)
    const enden = new Set(
      ermittleAktionen(start)
        .filter(istHaeutung)
        .filter((aktion) => aktion.schlangenId === 'schlange-1')
        .flatMap((aktion) => {
          const stellen = aktion.neueReihenfolge.map((id) => ids.indexOf(id))
          return [Math.min(...stellen) + 1, Math.max(...stellen) + 1]
        }),
    )
    expect(angeboteneKarten('Deine Schlange 1')).toEqual([...enden].sort((a, b) => a - b))
    expect(screen.queryAllByRole('button', { name: /^KI-Gegner 1, Schlange 1, Karte/ }), 'die andere Schlange bietet nichts an').toEqual([])
    expect(zugleiste().getByText(/Abschnitt/)).toBeInTheDocument()
  })

  it('O7 K2: nach dem ersten Ende sind nur die Enden angeboten, die mit ihm einen Abschnitt von 3 bis 5 Karten bilden', () => {
    spieleAm(erzeugeSzenario('haeutung'))
    tippe(handkarte(HAEUTUNG))
    tippeZiel('Deine Schlange 1 wählen')
    tippe(karteIn('Deine Schlange 1', 3))
    expect(karteIn('Deine Schlange 1', 3)).toHaveAttribute('aria-pressed', 'true')
    expect(angeboteneKarten('Deine Schlange 1'), 'Karte 3 bildet Abschnitte mit Karte 1 und Karte 5').toEqual([1, 5])
    expect(screen.queryByRole('button', { name: /^Deine Schlange 1, Karte 2:/ }), 'Karte 2 ist jetzt kein Ziel').toBeNull()
    tippe(karteIn('Deine Schlange 1', 3))
    expect(karteIn('Deine Schlange 1', 3), 'noch einmal angetippt: kein erstes Ende mehr').toHaveAttribute('aria-pressed', 'false')
    expect(angeboteneKarten('Deine Schlange 1')).toEqual([1, 2, 3, 4, 5])
  })
})

describe('O7 K1: Karten tauschen, verschieben, bestätigen, abbrechen', () => {
  it('O7 K1/A7.9 Beispiel 1: Antippen tauscht, die Ansage nennt die neue Folge, „Ausführen“ spielt genau die Aktion der Engine', () => {
    const start = erzeugeSzenario('haeutung')
    spieleAm(start)
    waehleAbschnitt('Deine Schlange 1', 1, 5)
    expect(gezeigteFarben('Deine Schlange 1')).toEqual(['Blau', 'Rot', 'Gelb', 'Rot', 'Gelb'])
    tausche('Deine Schlange 1', 1, 3)
    expect(gezeigteFarben('Deine Schlange 1')).toEqual(['Gelb', 'Rot', 'Blau', 'Rot', 'Gelb'])
    tausche('Deine Schlange 1', 2, 5)
    expect(gezeigteFarben('Deine Schlange 1')).toEqual(['Gelb', 'Gelb', 'Blau', 'Rot', 'Rot'])
    expect(zugleiste().getByText(/^Ansage:/)).toHaveTextContent('Schlangenhäutung, Karte 1–5 deiner Schlange 1: Gelb, Gelb, Blau, Rot, Rot.')
    expect(roh(), 'vor „Ausführen“ ist nichts gespielt').toBe(serialisiere(start))
    ausfuehren()
    expect(gespieltWurde(start, haeutungZu(start, 'schlange-1', 1, ['Gelb', 'Gelb', 'Blau', 'Rot', 'Rot']))).toBe(true)
  })

  it('O7 K1: die Pfeiltasten verschieben die Karte mit dem Fokus im Abschnitt; der Fokus bleibt bei ihr', () => {
    spieleAm(erzeugeSzenario('haeutung'))
    waehleAbschnitt('Deine Schlange 1', 1, 3)
    const blau = karteIn('Deine Schlange 1', 1)
    blau.focus()
    fireEvent.keyDown(blau, { key: 'ArrowRight' })
    expect(gezeigteFarben('Deine Schlange 1')).toEqual(['Rot', 'Blau', 'Gelb', 'Rot', 'Gelb'])
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Deine Schlange 1, Karte 2: Farbkarte Blau, 1 Punkt' }))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' })
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' })
    expect(gezeigteFarben('Deine Schlange 1'), 'über das Ende des Abschnitts hinaus geht es nicht').toEqual(['Rot', 'Gelb', 'Blau', 'Rot', 'Gelb'])
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Deine Schlange 1, Karte 3: Farbkarte Blau, 1 Punkt' }))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' })
    expect(gezeigteFarben('Deine Schlange 1')).toEqual(['Rot', 'Blau', 'Gelb', 'Rot', 'Gelb'])
    expect(zugleiste().getByText(/^Ansage:/)).toHaveTextContent('Karte 1–3 deiner Schlange 1: Rot, Blau, Gelb.')
  })

  it('O7 K1: „Abbrechen“ stellt den Ausgangszustand her', () => {
    const start = erzeugeSzenario('haeutung')
    spieleAm(start)
    waehleAbschnitt('Deine Schlange 1', 1, 5)
    tausche('Deine Schlange 1', 1, 5)
    expect(gezeigteFarben('Deine Schlange 1')).toEqual(['Gelb', 'Rot', 'Gelb', 'Rot', 'Blau'])
    tippe(zugleiste().getByRole('button', { name: 'Abbrechen' }))
    expect(gezeigteFarben('Deine Schlange 1')).toEqual(['Blau', 'Rot', 'Gelb', 'Rot', 'Gelb'])
    expect(handkarte(HAEUTUNG)).toHaveAttribute('aria-pressed', 'false')
    expect(angeboteneZiele()).toEqual([])
    expect(roh(), 'nichts gespielt').toBe(serialisiere(start))
    waehleAbschnitt('Deine Schlange 1', 1, 5)
    expect(gezeigteFarben('Deine Schlange 1'), 'eine neue Auswahl beginnt mit der Schlange, wie sie liegt').toEqual(['Blau', 'Rot', 'Gelb', 'Rot', 'Gelb'])
  })

  it('O7 D26/F13: bleibt die Farbfolge gleich, ist „Ausführen“ gesperrt, und daneben steht der Grund', () => {
    spieleAm(erzeugeSzenario('haeutung'))
    waehleAbschnitt('Deine Schlange 1', 1, 5)
    const ausfuehrenKnopf = () => zugleiste().getByRole('button', { name: 'Ausführen' })
    expect(ausfuehrenKnopf(), 'unverändert').toBeDisabled()
    expect(ausfuehrenKnopf()).toHaveAccessibleDescription(/D26/)
    tausche('Deine Schlange 1', 2, 4)
    expect(gezeigteFarben('Deine Schlange 1')).toEqual(['Blau', 'Rot', 'Gelb', 'Rot', 'Gelb'])
    expect(ausfuehrenKnopf(), 'Rot mit Rot getauscht').toBeDisabled()
    expect(ausfuehrenKnopf()).toHaveAccessibleDescription(/D26/)
    expect(zugleiste().queryByText(/^Ansage:/)).toBeNull()
    tausche('Deine Schlange 1', 1, 2)
    expect(ausfuehrenKnopf()).toBeEnabled()
    expect(ausfuehrenKnopf()).not.toHaveAccessibleDescription(/D26/)
  })
})

describe('O7 K3: Punkte vorher und nachher', () => {
  it('O7 K3/A11: die Zugleiste zeigt die Summen deines Zwischenstands vor und nach der Häutung, wie die Engine sie rechnet', () => {
    const start = erzeugeSzenario('haeutung-punkte')
    spieleAm(start)
    waehleAbschnitt('Deine Schlange 1', 1, 4)
    const vorher = berechneZwischenstand(start, 'spieler-1').spieler[0].summe
    expect(zugleiste().getByText(/^Deine Punkte/)).toHaveTextContent(`Deine Punkte: ${vorher}`)
    tausche('Deine Schlange 1', 2, 4)
    expect(gezeigteFarben('Deine Schlange 1')).toEqual(['Rot', 'Rot', 'Rot', 'Blau', 'Gelb'])
    const aktion = haeutungZu(start, 'schlange-1', 1, ['Rot', 'Rot', 'Rot', 'Blau'])
    const nachher = berechneZwischenstand(anwendeAktion(start, aktion).zustand, 'spieler-1').spieler[0].summe
    expect(nachher).toBeGreaterThan(vorher)
    expect(zugleiste().getByText(/^Deine Punkte/)).toHaveTextContent(`Deine Punkte: vorher ${vorher}, nachher ${nachher}`)
    expect(screen.getByRole('list', { name: /^Deine Schlange 1:/ }), 'die Schlange zeigt die neue Gruppe aus der Wertung der Engine').toHaveAccessibleName(/Farbgruppen Rot \(3\)/)
  })

  it('O7 K3/D9: in der Schlange eines Gegners stehen seine Punkte; zerstört die Häutung seine Gruppe, sinken sie', () => {
    const start = erzeugeSzenario('haeutung-punkte')
    spieleAm(start)
    waehleAbschnitt('KI-Gegner 1, Schlange 1', 1, 4)
    tausche('KI-Gegner 1, Schlange 1', 3, 4)
    expect(gezeigteFarben('KI-Gegner 1, Schlange 1')).toEqual(['Grün', 'Grün', 'Blau', 'Grün', 'Rot'])
    expect(zugleiste().getByText(/^Punkte von KI-Gegner 1/)).toHaveTextContent('Punkte von KI-Gegner 1: vorher 9, nachher 0')
  })
})

describe('O7: Häutung in der Schlange eines Gegners und U3', () => {
  it('O7 D9/A6: in der Schlange von KI-Gegner 1 ist die Häutung eine Ansage; „Ausführen“ sagt sie an', () => {
    const start = erzeugeSzenario('haeutung')
    spieleAm(start)
    tippe(handkarte(HAEUTUNG))
    tippeZiel('KI-Gegner 1, Schlange 1 wählen')
    tippe(karteIn('KI-Gegner 1, Schlange 1', 1))
    expect(angeboteneKarten('KI-Gegner 1, Schlange 1'), 'drei Karten: nur ein Abschnitt').toEqual([3])
    tippe(karteIn('KI-Gegner 1, Schlange 1', 3))
    tausche('KI-Gegner 1, Schlange 1', 2, 3)
    expect(zugleiste().getByText(/^Ansage:/)).toHaveTextContent('Schlangenhäutung, Karte 1–3 der Schlange 1 von KI-Gegner 1: Braun, Braun, Violett.')
    ausfuehren()
    expect(gespieltWurde(start, haeutungZu(start, 'schlange-2', 1, ['Braun', 'Braun', 'Violett']))).toBe(true)
  })

  it('O7/U3: „Ausführen“ übergibt genau ein Objekt aus den Aktionen der Engine, keine Abschrift', () => {
    const zustand = erzeugeSzenario('haeutung')
    const ansicht = tischAnsicht(zustand)
    const fuehreAus = vi.fn()
    render(<Tisch ansicht={ansicht} fuehreAus={fuehreAus} ablehnung={null} haeutungsVorschau={vorschauFuer(zustand)} />)
    waehleAbschnitt('Deine Schlange 1', 2, 4)
    tausche('Deine Schlange 1', 2, 3)
    tippe(zugleiste().getByRole('button', { name: 'Ausführen' }))
    expect(fuehreAus).toHaveBeenCalledTimes(1)
    expect(ansicht.aktionen.includes(fuehreAus.mock.calls[0][0])).toBe(true)
  })
})
