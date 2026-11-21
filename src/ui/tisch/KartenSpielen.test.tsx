import { describe, expect, it } from 'vitest'
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { serialisiere } from '../../engine'
import type { Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { erzeugeZufall } from '../../engine/testing/zufall'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { kartenname } from '../karten/kartentexte'
import { roh } from '../spiel/__tests__/steuerung'
import { mittelspiel } from './__tests__/szenarien'
import {
  aktionMit,
  angeboteneZiele,
  ausfuehren,
  bedienbar,
  erwarteteZiele,
  gespieltWurde,
  handkarte,
  handRegion,
  spieleAm,
  tippe,
  tippeZiel,
  zugleiste,
} from './__tests__/bedienen'

/*
O5, Kriterien 1, 2 und 4: Karte antippen, dann Ziel antippen, dann die Ansage
bestätigen. Was angeboten ist, kommt allein aus den Aktionen der Engine (U3);
die Erwartung rechnet der Test selbst aus `ermittleAktionen` und `auswahl`.
*/

/** Szenarien, in denen du am Zug bist, mit allen Kartenarten der Basis. */
const SZENARIEN = [
  'farbkarte-beim-gegner',
  'regenbogen',
  'blockade-abwehr',
  'frass-eigen',
  'frass-zwei-spieler',
  'frass-fusion',
  'farbendieb',
  'farbendieb-abwehr',
  'fusion-eigen',
  'fusion-beim-gegner',
  'schlangengrube',
  'verdoppler',
  'nur-sonderkarten',
  'nur-farbenschutz',
  'haeutung',
  'haeutung-nicht-moeglich',
]

const zustaende = (): { name: string; zustand: Spielzustand }[] => [
  ...SZENARIEN.map((name) => ({ name, zustand: erzeugeSzenario(name) })),
  { name: 'mittelspiel', zustand: mittelspiel() },
]

/** Die Handkarten, die die Engine jetzt spielen lässt. */
function spielbare(zustand: Spielzustand) {
  const ids = new Set(bedienbar(zustand).flatMap((aktion) => ('karteId' in aktion ? [aktion.karteId] : [])))
  return zustand.spieler[0].hand.filter((karte) => ids.has(karte.id))
}

describe('O5 K1: Nach dem Antippen einer Handkarte sind genau die erlaubten Ziele markiert', () => {
  it('O5 K1/U3: für jede spielbare Handkarte in jedem Szenario genau die Ziele der Engine, vorher keine', () => {
    for (const { name, zustand } of zustaende()) {
      spieleAm(zustand)
      expect(angeboteneZiele(), `${name}: ohne gewählte Karte steht kein Ziel am Tisch`).toEqual([])
      for (const karte of spielbare(zustand)) {
        const knopf = handRegion().getAllByRole('button', { name: kartenname(karte) }).find((element) => element.getAttribute('aria-pressed') === 'false')!
        tippe(knopf)
        expect(knopf, `${name}: ${karte.id} ist nach dem Antippen gewählt`).toHaveAttribute('aria-pressed', 'true')
        expect(angeboteneZiele(), `${name}: Ziele nach ${karte.id}`).toEqual(erwarteteZiele(zustand, [{ art: 'karte', karteId: karte.id }]))
        tippe(knopf)
      }
      cleanup()
    }
  })

  it('O5 K1: spielbar sind genau die Handkarten der Engine; die anderen sind gesperrt und sagen es', () => {
    for (const { name, zustand } of zustaende()) {
      spieleAm(zustand)
      const knoepfe = handRegion().getAllByRole<HTMLButtonElement>('button')
      const frei = knoepfe.filter((knopf) => !knopf.disabled).map((knopf) => knopf.getAttribute('aria-label')).sort()
      expect(frei, `${name}: bedienbare Handkarten`).toEqual(spielbare(zustand).map(kartenname).sort())
      for (const knopf of knoepfe.filter((element) => element.disabled)) {
        expect(knopf.getAttribute('aria-label'), `${name}: gesperrte Karte`).toMatch(/\(jetzt nicht spielbar\)$/)
      }
      cleanup()
    }
  })

  it('O5 K1: dieselbe Karte noch einmal, „Abbrechen“ oder Escape heben die Auswahl auf', () => {
    const zustand = erzeugeSzenario('farbkarte-beim-gegner')
    spieleAm(zustand)
    const rot = handkarte('Farbkarte Rot, 1 Punkt')
    tippe(rot)
    expect(angeboteneZiele()).toHaveLength(6)
    tippe(rot)
    expect(angeboteneZiele(), 'noch einmal angetippt').toEqual([])
    expect(rot).toHaveAttribute('aria-pressed', 'false')

    tippe(rot)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(angeboteneZiele(), 'Escape').toEqual([])
    expect(rot).toHaveAttribute('aria-pressed', 'false')

    tippe(rot)
    tippe(zugleiste().getByRole('button', { name: 'Abbrechen' }))
    expect(angeboteneZiele(), 'Abbrechen').toEqual([])
    expect(roh(), 'nichts ausgeführt').toBe(serialisiere(zustand))
  })

  it('O5 K1: eine andere Handkarte wechselt die Auswahl auf sie und ihre Ziele', () => {
    const zustand = erzeugeSzenario('blockade-abwehr')
    spieleAm(zustand)
    tippe(handkarte('Farbkarte Blau, 1 Punkt'))
    const blockade = zustand.spieler[0].hand[0]
    tippe(handkarte(blockade))
    expect(handkarte('Farbkarte Blau, 1 Punkt')).toHaveAttribute('aria-pressed', 'false')
    expect(angeboteneZiele()).toEqual(erwarteteZiele(zustand, [{ art: 'karte', karteId: blockade.id }]))
  })
})

describe('O5 K2: Farbkarte an beide Enden jeder Schlange oder als neue Schlange', () => {
  const zustand = () =>
    baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(61) })
      .hand(0, ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett'])
      .schlange(0, ['Blau'])
      .schlange(1, ['Gelb', 'Gelb'])
      .zustand()

  it('O5 K2/D9: beide Enden deiner und der gegnerischen Schlange und „Neue Schlange“', () => {
    const start = zustand()
    spieleAm(start)
    tippe(handkarte('Farbkarte Rot, 1 Punkt'))
    for (const name of ['Deine Schlange 1: Anfang', 'Deine Schlange 1: Ende', 'KI-Gegner 1, Schlange 1: Anfang', 'KI-Gegner 1, Schlange 1: Ende', 'Neue Schlange']) {
      expect(screen.getByRole('button', { name }), name).toHaveAttribute('aria-pressed', 'false')
    }
    expect(angeboteneZiele()).toHaveLength(5)
    expect(angeboteneZiele()).toEqual(erwarteteZiele(start, [{ art: 'karte', karteId: start.spieler[0].hand[0].id }]))
  })

  it('O5 K2/D9: an das Ende der gegnerischen Schlange gelegt, nach der Ansage', () => {
    const start = zustand()
    spieleAm(start)
    tippe(handkarte('Farbkarte Rot, 1 Punkt'))
    tippeZiel('KI-Gegner 1, Schlange 1: Ende')
    expect(screen.getByRole('button', { name: 'KI-Gegner 1, Schlange 1: Ende' })).toHaveAttribute('aria-pressed', 'true')
    expect(zugleiste().getByText(/Rot/)).toHaveTextContent('KI-Gegner 1')
    ausfuehren()
    const rot = start.spieler[0].hand[0].id
    expect(
      gespieltWurde(start, aktionMit(start, (a) => a.typ === 'FarbkarteLegen' && a.karteId === rot && a.ziel.art === 'schlange' && a.ziel.schlangenId === 'schlange-2' && a.ziel.seite === 'ende')),
    ).toBe(true)
  })

  it('O5 K2/A5: „Neue Schlange“ beginnt deine zweite Schlange', () => {
    const start = zustand()
    spieleAm(start)
    tippe(handkarte('Farbkarte Grün, 3 Punkte'))
    tippeZiel('Neue Schlange')
    ausfuehren()
    const gruen = start.spieler[0].hand[3].id
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'FarbkarteLegen' && a.karteId === gruen && a.ziel.art === 'neueSchlange'))).toBe(true)
  })
})

describe('O5 K4/B2: Vor dem Ausführen steht die Ansage zum Bestätigen', () => {
  it('O5 K4/A7.1: Farbendieb: Karte und Platz gewählt, die Zugleiste sagt beides, ausgeführt wird erst nach „Ausführen“', () => {
    const start = erzeugeSzenario('farbendieb')
    spieleAm(start)
    tippe(handkarte('Sonderkarte Farbendieb'))
    expect(zugleiste().queryByRole('button', { name: 'Ausführen' }), 'ohne Ziel nichts auszuführen').toBeNull()
    tippeZiel('KI-Gegner 1, Schlange 1, Karte 1: Farbkarte Blau, 1 Punkt')
    tippeZiel('Deine Schlange 1: zwischen Karte 1 und 2')
    const text = zugleiste().getByText(/Farbendieb/)
    expect(text).toHaveTextContent('Blau')
    expect(text).toHaveTextContent('KI-Gegner 1')
    expect(text).toHaveTextContent('deine Schlange 1')
    expect(roh(), 'vor der Bestätigung ist nichts gespielt').toBe(serialisiere(start))
    ausfuehren()
    const blau = start.spieler[1].schlangen[0].karten[0].id
    expect(
      gespieltWurde(start, aktionMit(start, (a) => a.typ === 'FarbendiebSpielen' && a.quelle.karteId === blau && a.ziel.art === 'schlange' && a.ziel.position === 1)),
    ).toBe(true)
  })

  it('O5 K4: „Ansehen“ zeigt die gewählte Karte gross mit ihrem Text; Escape dort hebt die Auswahl nicht auf', () => {
    spieleAm(erzeugeSzenario('farbendieb'))
    tippe(handkarte('Sonderkarte Farbendieb'))
    tippe(zugleiste().getByRole('button', { name: 'Ansehen' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { level: 2 })).toHaveTextContent('Farbendieb')
    expect(dialog).toHaveTextContent('Erlaubt es, einem anderen Spieler eine Karte aus dessen Schlange wegzunehmen')
    fireEvent.keyDown(within(dialog).getByRole('button', { name: 'Schliessen' }), { key: 'Escape' })
    expect(handkarte('Sonderkarte Farbendieb')).toHaveAttribute('aria-pressed', 'true')
  })
})
