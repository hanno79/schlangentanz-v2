import { describe, expect, it } from 'vitest'
import { erstellePartie, pruefeInvarianten } from '../index'
import type { Spielkarte, Spielzustand } from '../index'
import { erzeugeZufall } from '../testing/zufall'

function partie(spielerzahl: number, erweiterung: boolean, saat = 1): Spielzustand {
  return erstellePartie({ spielerzahl, erweiterung, zufall: erzeugeZufall(saat) })
}

/** Jede Spielkarte, egal wo sie liegt. Bewusst unabhängig von `alleSpielkarten` der Engine, damit der Test sie nicht nur nachspricht. */
function alleSpielkarten(zustand: Spielzustand): Spielkarte[] {
  return [
    ...zustand.nachziehstapel,
    ...zustand.spieler.flatMap((spieler) => [
      ...spieler.hand,
      ...spieler.ablagestapel,
      ...spieler.schlangen.flatMap((schlange) => [
        ...schlange.karten,
        ...schlange.fusionen.flatMap((fusion) => fusion.unter),
      ]),
    ]),
    ...zustand.ausliegendeGruben.map((grube) => grube.karte),
    ...(zustand.schwebend === null ? [] : [zustand.schwebend.karte]),
    ...zustand.ausDemSpiel.filter((karte): karte is Spielkarte => karte.typ === 'Farbkarte' || karte.typ === 'Sonderkarte'),
  ]
}

/** Stückzahl je Farbe beziehungsweise Sonderkartenname. */
function stueckzahlen(karten: Spielkarte[]): Record<string, number> {
  const zahlen: Record<string, number> = {}
  for (const karte of karten) {
    const art = karte.typ === 'Farbkarte' ? karte.farbe : karte.name
    zahlen[art] = (zahlen[art] ?? 0) + 1
  }
  return zahlen
}

const BASIS: Record<string, number> = {
  Blau: 15,
  Rot: 15,
  Gelb: 15,
  Violett: 12,
  Braun: 12,
  Grün: 9,
  Farbenschutz: 4,
  Regenbogenschlange: 4,
  Schlangenfrass: 4,
  Schlangenblockade: 3,
  Farbendieb: 4,
  Schlangengrube: 3,
  Farbenfusion: 4,
  Verdoppler: 4,
}

const SPIELERZAHLEN = [2, 3, 4]
const ALLE_PARTIEN = SPIELERZAHLEN.flatMap((spielerzahl) => [
  { spielerzahl, erweiterung: false },
  { spielerzahl, erweiterung: true },
])

describe('A1/A4: Material ohne Erweiterung', () => {
  it.each(SPIELERZAHLEN)('A1: %i Spieler: 108 Spielkarten mit den Stückzahlen aus A1', (spielerzahl) => {
    const karten = alleSpielkarten(partie(spielerzahl, false))
    expect(karten, 'A1: 78 Farbkarten + 30 Sonderkarten').toHaveLength(108)
    expect(stueckzahlen(karten)).toEqual(BASIS)
    expect(new Set(karten.map((karte) => karte.id)).size, 'A1: jede Karte hat eine eigene Id').toBe(108)
  })

  it('A1: Blau, Rot und Gelb bringen 1 Punkt, Violett und Braun 2, Grün 3', () => {
    const punkte = new Map<string, Set<number>>()
    for (const karte of alleSpielkarten(partie(2, false))) {
      if (karte.typ !== 'Farbkarte') continue
      punkte.set(karte.farbe, (punkte.get(karte.farbe) ?? new Set()).add(karte.punkte))
    }
    expect(Object.fromEntries([...punkte].map(([farbe, werte]) => [farbe, [...werte]]))).toEqual({
      Blau: [1],
      Rot: [1],
      Gelb: [1],
      Violett: [2],
      Braun: [2],
      Grün: [3],
    })
  })

  it.each(SPIELERZAHLEN)('A4: %i Spieler ohne Erweiterung: keine Aufgaben, keine Comeback- und Risiko-Karten', (spielerzahl) => {
    const zustand = partie(spielerzahl, false)
    expect(zustand.erweiterung).toBe(false)
    expect(zustand.offeneAufgaben).toEqual([])
    expect(zustand.aufgabenStapel).toEqual([])
    for (const spieler of zustand.spieler) {
      expect(spieler.geheimeAufgabe, `A4: ${spieler.id} hat ohne Erweiterung eine geheime Aufgabe`).toBeNull()
      expect(spieler.comeback).toBeNull()
      expect(spieler.risikoKarten).toEqual([])
    }
  })
})

describe('A1/A4: Material mit Erweiterung', () => {
  it.each(SPIELERZAHLEN)('A1: %i Spieler: 112 Spielkarten, dazu 3 Schlangenhäutungen und 1 Schlangenkorb', (spielerzahl) => {
    const karten = alleSpielkarten(partie(spielerzahl, true))
    expect(karten).toHaveLength(112)
    expect(stueckzahlen(karten)).toEqual({ ...BASIS, Schlangenhäutung: 3, 'Schlangenkorb des Glücks': 1 })
  })

  it.each(SPIELERZAHLEN)('A4: %i Spieler: 15 Aufgaben, 3 offen, je Spieler 1 geheim, der Rest verdeckt', (spielerzahl) => {
    const zustand = partie(spielerzahl, true)
    expect(zustand.offeneAufgaben).toHaveLength(3)
    for (const spieler of zustand.spieler) {
      expect(spieler.geheimeAufgabe, `A4: ${spieler.id} hat keine geheime Aufgabe`).not.toBeNull()
      expect(spieler.erfuellteAufgaben).toEqual([])
    }
    expect(zustand.aufgabenStapel).toHaveLength(15 - 3 - spielerzahl)
    const alle = [
      ...zustand.offeneAufgaben,
      ...zustand.aufgabenStapel,
      ...zustand.spieler.map((spieler) => spieler.geheimeAufgabe),
    ]
    expect(new Set(alle.map((aufgabe) => aufgabe?.id)).size).toBe(15)
  })

  it('A9: die 15 Aufgaben tragen Nummer, Name und Punkte aus der Tabelle in A9', () => {
    const zustand = partie(2, true)
    const alle = [
      ...zustand.offeneAufgaben,
      ...zustand.aufgabenStapel,
      ...zustand.spieler.flatMap((spieler) => (spieler.geheimeAufgabe === null ? [] : [spieler.geheimeAufgabe])),
    ].sort((a, b) => a.id.localeCompare(b.id))
    expect(alle.map((aufgabe) => [aufgabe.id, aufgabe.name, aufgabe.punkte])).toEqual([
      ['aufgabe-01', 'Farbenpracht', 8],
      ['aufgabe-02', 'Farbharmonie', 10],
      ['aufgabe-03', 'Farbkombination', 5],
      ['aufgabe-04', 'Farbvielfalt', 9],
      ['aufgabe-05', 'Vielfaltskönig', 9],
      ['aufgabe-06', 'Farbwechsler', 6],
      ['aufgabe-07', 'Fusionsexperte', 6],
      ['aufgabe-08', 'Schlangenbeschwörer', 7],
      ['aufgabe-09', 'Schlangenmeister', 4],
      ['aufgabe-10', 'Schlangenrepertoire', 4],
      ['aufgabe-11', 'Schlangenbändiger', 7],
      ['aufgabe-12', 'Schlangentanz', 7],
      ['aufgabe-13', 'Symmetriemeister', 10],
      ['aufgabe-14', 'Gelber Schatz', 5],
      ['aufgabe-15', 'Lila Riese', 5],
    ])
    expect(alle.find((aufgabe) => aufgabe.name === 'Lila Riese')?.bedingung).toBe(
      'Bilde eine ununterbrochene Reihe aus min. 5 violetten Karten.',
    )
  })

  it.each(SPIELERZAHLEN)(
    'A4: %i Spieler: jeder hat 1 Comeback- und 2 Risiko-Belohnungs-Karten offen vor sich, nicht im Kartenstapel (C22)',
    (spielerzahl) => {
      const zustand = partie(spielerzahl, true)
      const ids = new Set<string>()
      for (const spieler of zustand.spieler) {
        expect(spieler.comeback?.karte.typ).toBe('Comeback')
        expect(spieler.comeback?.verbraucht).toBe(false)
        expect(spieler.risikoKarten.map((karte) => karte.typ)).toEqual(['Risiko-Belohnung', 'Risiko-Belohnung'])
        for (const karte of [spieler.comeback!.karte, ...spieler.risikoKarten]) ids.add(karte.id)
      }
      expect(ids.size, 'A4: jede Comeback- und Risiko-Karte gibt es nur einmal').toBe(3 * spielerzahl)
      const kartenarten = new Set<string>(alleSpielkarten(zustand).map((karte) => (karte.typ === 'Sonderkarte' ? karte.name : '')))
      expect(kartenarten.has('Comeback')).toBe(false)
      expect(kartenarten.has('Risiko-Belohnung')).toBe(false)
    },
  )
})

describe('A4: Spielvorbereitung', () => {
  it.each(ALLE_PARTIEN)('A4: $spielerzahl Spieler, Erweiterung $erweiterung: je 5 Handkarten, der Rest im Nachziehstapel', ({ spielerzahl, erweiterung }) => {
    const zustand = partie(spielerzahl, erweiterung)
    for (const spieler of zustand.spieler) {
      expect(spieler.hand, `A4: ${spieler.id}`).toHaveLength(5)
      expect(spieler.schlangen).toEqual([])
    }
    expect(zustand.nachziehstapel).toHaveLength((erweiterung ? 112 : 108) - 5 * spielerzahl)
  })

  it.each(ALLE_PARTIEN)('A4: $spielerzahl Spieler, Erweiterung $erweiterung: jeder hat einen eigenen, leeren Ablagestapel, einen gemeinsamen gibt es nicht', ({ spielerzahl, erweiterung }) => {
    const zustand = partie(spielerzahl, erweiterung)
    expect(Object.keys(zustand)).not.toContain('ablagestapel')
    for (const spieler of zustand.spieler) expect(spieler.ablagestapel).toEqual([])
  })

  it('B2: ein Mensch gegen KI-Gegner; der Mensch beginnt im ersten Teilzug, die Partie läuft', () => {
    const zustand = partie(4, false)
    expect(zustand.spieler.map((spieler) => spieler.steuerung)).toEqual(['Mensch', 'KI', 'KI', 'KI'])
    expect(zustand.partiephase).toBe('Laufend')
    expect(zustand.zug.spielerIndex).toBe(0)
    expect(zustand.zug.teilzug).toBe(1)
    expect(zustand.schlussrundeAusloeser).toBeNull()
  })

  it.each([1, 5, 2.5, Number.NaN])('A2: Spielerzahl %s wird mit Grund abgelehnt', (spielerzahl) => {
    expect(() => partie(spielerzahl, false)).toThrow(/2 bis 4 Spieler/)
  })

  it.each(ALLE_PARTIEN)('B2: $spielerzahl Spieler, Erweiterung $erweiterung: gleiche Saat ergibt denselben Anfang, andere Saat einen anderen', ({ spielerzahl, erweiterung }) => {
    expect(partie(spielerzahl, erweiterung, 7)).toEqual(partie(spielerzahl, erweiterung, 7))
    expect(partie(spielerzahl, erweiterung, 7)).not.toEqual(partie(spielerzahl, erweiterung, 8))
  })

  it('B2: gemischt wird nur mit der übergebenen Zufallsquelle; Werte ausserhalb von [0, 1) werden abgelehnt', () => {
    expect(() => erstellePartie({ spielerzahl: 2, erweiterung: false, zufall: () => 1 })).toThrow(/Zufallswert/)
    const immerNull = erstellePartie({ spielerzahl: 2, erweiterung: false, zufall: () => 0 })
    expect(immerNull).toEqual(erstellePartie({ spielerzahl: 2, erweiterung: false, zufall: () => 0 }))
  })

  it.each(ALLE_PARTIEN)('A4: $spielerzahl Spieler, Erweiterung $erweiterung: der Startzustand verletzt keine Invariante', ({ spielerzahl, erweiterung }) => {
    const verletzt = pruefeInvarianten(partie(spielerzahl, erweiterung)).filter((befund) => befund.verletzt)
    expect(verletzt).toEqual([])
  })
})
