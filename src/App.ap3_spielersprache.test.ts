/*
Author: Claude Code (AP-3)
Datum: 30.07.2026
Version: 1.0
Beschreibung: AP-3 — Aktionslabels sprechen Spielersprache statt technischer IDs
              (Onboarding-Findings 4, 11, 14).

Geprüft wird:
 1. Kein Label enthält noch eine rohe Karten-, Schlangen- oder Spieler-Id.
 2. Spielernamen werden aus dem Zustand aufgelöst, nicht aus dem Id-Präfix geraten.
 3. Die Perspektive steuert „deine …" gegenüber „eigene …", damit das KI-Protokoll
    nicht in der zweiten Person spricht, während die KI zieht.
 4. Wirkungsgleiche Handkarten-Aktionen werden zusammengefasst,
    Brettkarten-Ziele ausdrücklich nicht.
*/

import { describe, expect, it } from 'vitest'
import {
  erstelleEinzelspielerSpielzustand,
  erstelleSpielzustand,
  ermittleLegaleAktionen,
  starteAusspielphase,
} from './engine'
import type { FarbkarteInfo, SpielAktion, Spielzustand } from './engine'
import { erstelleAktionsLabel } from './aktionsLabel'
import { gruppiereWirkungsgleicheAktionen } from './aktionsGruppen'
import { kartenArtSchluessel, karteAnzeigename } from './kartenTexte'

function farbkarte(id: string, farbe: FarbkarteInfo['farbe'], punkte: number): FarbkarteInfo {
  return { typ: 'Farbkarte', id, farbe, punkte }
}

function menschId(zustand: Spielzustand): string {
  return zustand.spieler.find((spieler) => spieler.steuerung === 'Mensch')!.id
}

describe('AP-3 Kartenvokabular', () => {
  it('gibt Farbkarten ihren Spielnamen', () => {
    expect(karteAnzeigename(farbkarte('blau-01', 'Blau', 1))).toBe('Wasserwirbel')
    expect(karteAnzeigename({ typ: 'Sonderkarte', id: 'x', name: 'Farbendieb' })).toBe('Farbendieb')
  })

  it('macht gleichwertige Karten über den Artschlüssel gleich, verschiedene ungleich', () => {
    expect(kartenArtSchluessel(farbkarte('blau-01', 'Blau', 1)))
      .toBe(kartenArtSchluessel(farbkarte('blau-09', 'Blau', 1)))
    expect(kartenArtSchluessel(farbkarte('blau-01', 'Blau', 1)))
      .not.toBe(kartenArtSchluessel(farbkarte('rot-01', 'Rot', 1)))
  })
})

describe('AP-3 Aktionslabels ohne technische IDs', () => {
  it('nennt Karten beim Namen statt bei der Id', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const label = erstelleAktionsLabel(zustand, { perspektiveSpielerId: menschId(zustand) })
    const aktionen = ermittleLegaleAktionen(zustand)

    expect(aktionen.length).toBeGreaterThan(0)
    for (const aktion of aktionen) {
      const text = label(aktion)
      expect(text, `Label enthält noch eine Karten-Id: ${text}`).not.toMatch(/\b(blau|rot|gelb|violett|braun|gruen)-\d+/)
      expect(text, `Label enthält noch eine Schlangen-Id: ${text}`).not.toMatch(/schlange-/)
      expect(text, `Label enthält noch eine Spieler-Id: ${text}`).not.toMatch(/spieler-|ki-gegner-/)
    }
  })

  it('löst Spielernamen aus dem Zustand auf — auch beim Einzelspieler-Id-Schema', () => {
    // Die alte spielerNameAusId ersetzte nur das Präfix "spieler-" und hätte hier
    // die rohe Id "ki-gegner-1" ausgegeben.
    const zustand = starteAusspielphase(erstelleEinzelspielerSpielzustand(1, () => 0.42))
    const aktiver = zustand.spieler[zustand.aktiverSpielerIndex]
    const gegner = zustand.spieler[1]
    zustand.spieler[0].hand = [{ typ: 'Sonderkarte', id: 'grube-1', name: 'Schlangengrube' }, ...aktiver.hand.slice(1)]

    const label = erstelleAktionsLabel(zustand, { perspektiveSpielerId: menschId(zustand) })
    const grube: SpielAktion = {
      typ: 'SonderkarteSpielen',
      spielerId: aktiver.id,
      handkartenId: 'grube-1',
      zielSpielerId: gegner.id,
    }

    expect(gegner.name).toBe('KI Gegner 1')
    expect(label(grube)).toBe('Schlangengrube auf KI Gegner 1 spielen')
  })

  it('formuliert eigene Schlangen je nach Perspektive', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const aktiver = zustand.spieler[0]
    zustand.spieler[0].schlangen = [{ id: 'meine-1', zustand: 'aktiv', karten: [farbkarte('blau-77', 'Blau', 1)] }]
    const anlegen: SpielAktion = {
      typ: 'KarteAnlegen',
      spielerId: aktiver.id,
      handkartenId: aktiver.hand[0].id,
      schlangenId: 'meine-1',
      position: 'links',
    }

    const mitPerspektive = erstelleAktionsLabel(zustand, { perspektiveSpielerId: aktiver.id })
    expect(mitPerspektive(anlegen)).toBe('Wasserwirbel links an deine erste Schlange anlegen')

    // Ohne Perspektive (KI-Protokoll) darf nicht in der zweiten Person formuliert werden.
    const ohnePerspektive = erstelleAktionsLabel(zustand)
    expect(ohnePerspektive(anlegen)).toBe('Wasserwirbel links an eigene erste Schlange anlegen')
  })

  it('nennt bei Brettzielen die Position, weil dort Karten nicht austauschbar sind', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const aktiver = zustand.spieler[0]
    zustand.spieler[0].schlangen = [{
      id: 'meine-1',
      zustand: 'aktiv',
      karten: [farbkarte('blau-a', 'Blau', 1), farbkarte('rot-a', 'Rot', 1), farbkarte('blau-b', 'Blau', 1)],
    }]
    const label = erstelleAktionsLabel(zustand, { perspektiveSpielerId: aktiver.id })

    const frassAufErste: SpielAktion = {
      typ: 'SchlangenfrassSpielen',
      spielerId: aktiver.id,
      handkartenId: 'frass-1',
      ziele: [{ spielerId: aktiver.id, schlangenId: 'meine-1', kartenId: 'blau-a' }],
    }
    const frassAufDritte: SpielAktion = { ...frassAufErste, ziele: [{ spielerId: aktiver.id, schlangenId: 'meine-1', kartenId: 'blau-b' }] }

    expect(label(frassAufErste)).toContain('Wasserwirbel an Position 1')
    expect(label(frassAufDritte)).toContain('Wasserwirbel an Position 3')
    expect(label(frassAufErste)).not.toBe(label(frassAufDritte))
  })
})

describe('AP-3 Entdopplung wirkungsgleicher Aktionen', () => {
  it('fasst gleichwertige Handkarten zu einer Aktion zusammen', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const hand = zustand.spieler[0].hand
    const aktionen = ermittleLegaleAktionen(zustand)

    // Ausgangslage: fünf gleichwertige blaue Handkarten.
    expect(hand).toHaveLength(5)
    expect(new Set(hand.map(kartenArtSchluessel)).size).toBe(1)
    expect(aktionen).toHaveLength(5)

    const gruppen = gruppiereWirkungsgleicheAktionen(aktionen, hand)
    expect(gruppen).toHaveLength(1)
    expect(gruppen[0].anzahl).toBe(5)
  })

  it('fasst Brettkarten-Ziele NICHT zusammen — dort ist die Position wirksam', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const aktiver = zustand.spieler[0]
    zustand.spieler[0].schlangen = [{
      id: 'meine-1',
      zustand: 'aktiv',
      karten: [farbkarte('blau-a', 'Blau', 1), farbkarte('rot-a', 'Rot', 1), farbkarte('blau-b', 'Blau', 1)],
    }]
    const basis = { typ: 'SchlangenfrassSpielen', spielerId: aktiver.id, handkartenId: aktiver.hand[0].id } as const
    const aktionen: SpielAktion[] = [
      { ...basis, ziele: [{ spielerId: aktiver.id, schlangenId: 'meine-1', kartenId: 'blau-a' }] },
      { ...basis, ziele: [{ spielerId: aktiver.id, schlangenId: 'meine-1', kartenId: 'blau-b' }] },
    ]

    // Beide Ziele sind blaue Karten derselben Art — trotzdem zwei Aktionen, weil
    // die Restschlange danach unterschiedlich aussieht.
    expect(gruppiereWirkungsgleicheAktionen(aktionen, aktiver.hand)).toHaveLength(2)
  })

  it('erhält die Reihenfolge des ersten Auftretens', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const hand = zustand.spieler[0].hand
    const aktionen: SpielAktion[] = [
      { typ: 'PflichtAbwurf', spielerId: zustand.spieler[0].id, handkartenId: hand[0].id },
      { typ: 'NeueSchlangeStarten', spielerId: zustand.spieler[0].id, handkartenId: hand[1].id },
      { typ: 'PflichtAbwurf', spielerId: zustand.spieler[0].id, handkartenId: hand[2].id },
    ]
    const gruppen = gruppiereWirkungsgleicheAktionen(aktionen, hand)
    expect(gruppen.map((gruppe) => gruppe.aktion.typ)).toEqual(['PflichtAbwurf', 'NeueSchlangeStarten'])
    expect(gruppen[0].anzahl).toBe(2)
  })
})

describe('AP-3 Lobby benennt Gegner spec-nah', () => {
  it('erzeugt Mensch plus KI Gegner 1..3 statt generischer Spielernummern', () => {
    const zustand = erstelleEinzelspielerSpielzustand(3, () => 0.42)
    expect(zustand.spieler.map((spieler) => spieler.name)).toEqual([
      'Spieler',
      'KI Gegner 1',
      'KI Gegner 2',
      'KI Gegner 3',
    ])
    expect(zustand.spieler[0].steuerung).toBe('Mensch')
    expect(zustand.spieler.slice(1).every((spieler) => spieler.steuerung === 'KI')).toBe(true)
  })
})
