// @vitest-environment node
import { readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { AktionsErgebnis, SpielAktion, Spielzustand } from '../index'
import { ENGINE_MOTOR, dauerlauf, dauerlaufPartien, spieleDauerlaufPartie } from '../testing/dauerlauf'
import type { Motor } from '../testing/dauerlauf'
import { partienDesTeils, TEILE } from './dauerlauf_lang'
import { erwarteGeprueftenLauf, neuerZugzaehler, regelPruefer, spieleGeprueft } from './dauerlauf_pruefer'

const ZUG_BEENDEN = (zustand: Spielzustand): SpielAktion[] => [
  { typ: 'ZugBeenden', spielerId: zustand.spieler[zustand.zug.spielerIndex].id },
]

/** Ein Motor zum Prüfen des Gerüsts: „Zug beenden“ reicht weiter, nach `bisEnde` Zügen ist Schluss. */
function zaehlMotor(bisEnde: number, verfaelsche?: (zustand: Spielzustand) => void): Motor {
  let zuege = 0
  return {
    aktionen: ZUG_BEENDEN,
    pruefe: () => ({ erlaubt: true }),
    anwende: (zustand): AktionsErgebnis => {
      const neu = structuredClone(zustand)
      zuege += 1
      neu.zug.spielerIndex = (neu.zug.spielerIndex + 1) % neu.spieler.length
      if (zuege >= bisEnde) {
        // A10: Beendet ist die Partie erst mit leerem Nachziehstapel.
        neu.spieler[0].ablagestapel.push(...neu.nachziehstapel.splice(0))
        neu.partiephase = 'Beendet'
        neu.schlussrundeAusloeser = 0
      }
      verfaelsche?.(neu)
      return { zustand: neu, ereignisse: [] }
    },
  }
}

describe('A10: Dauerlauf-Grundgerüst', () => {
  it('A10: die Partien laufen reihum mit 2, 3 und 4 Spielern und festen Saaten', () => {
    expect(dauerlaufPartien(6, true)).toEqual([
      { saat: 1, spielerzahl: 2, erweiterung: true },
      { saat: 2, spielerzahl: 3, erweiterung: true },
      { saat: 3, spielerzahl: 4, erweiterung: true },
      { saat: 4, spielerzahl: 2, erweiterung: true },
      { saat: 5, spielerzahl: 3, erweiterung: true },
      { saat: 6, spielerzahl: 4, erweiterung: true },
    ])
  })

  it('A5: zählt die Engine in einer laufenden Partie keine Aktion auf, meldet der Lauf „festgefahren“', () => {
    const ohneAktion: Motor = { ...zaehlMotor(5), aktionen: () => [] }
    const ergebnis = spieleDauerlaufPartie({ saat: 1, spielerzahl: 2, erweiterung: false }, { motor: ohneAktion })
    expect(ergebnis).toMatchObject({ ausgang: 'festgefahren', schritte: 0 })
    expect(ergebnis.detail).toMatch(/keine Aktion.*Spieler 1 hält 5 Handkarten/)
    expect(ENGINE_MOTOR.aktionen).toBeTypeOf('function')
  })

  it('B2: eine aufgezählte Aktion, die die Engine ablehnt, wird gemeldet, auch wenn der Lauf sie nicht wählt', () => {
    const zweiAktionen: Motor = {
      ...zaehlMotor(5),
      aktionen: (zustand) => [...ZUG_BEENDEN(zustand), { typ: 'ZugBeenden', spielerId: 'niemand' }],
      pruefe: (_, aktion) => (aktion.spielerId === 'niemand' ? { erlaubt: false, grund: 'unbekannt' } : { erlaubt: true }),
    }
    const ergebnis = spieleDauerlaufPartie({ saat: 1, spielerzahl: 2, erweiterung: false }, { motor: zweiAktionen })
    expect(ergebnis).toMatchObject({ ausgang: 'abgelehnt', schritte: 0, detail: expect.stringContaining('niemand') })
  })

  it('A10: ein Prüfer je Partie sieht jeden Schritt; meldet er etwas, hält der Lauf mit „verstoss“ an', () => {
    let partien = 0
    const neuerPruefer = () => {
      partien += 1
      let schritte = 0
      return () => (++schritte === 3 ? 'dritter Schritt' : null)
    }
    const ergebnisse = dauerlauf(dauerlaufPartien(2, false), { motor: zaehlMotor(10), neuerPruefer })
    expect(partien).toBe(2)
    expect(ergebnisse.map((ergebnis) => [ergebnis.ausgang, ergebnis.schritte])).toEqual([
      ['verstoss', 3],
      ['verstoss', 3],
    ])
    expect(ergebnisse[0].detail).toContain('dritter Schritt')
  })

  it('A10: eine Partie, die endet, meldet „beendet“ mit der Zahl der Schritte', () => {
    const ergebnis = spieleDauerlaufPartie({ saat: 1, spielerzahl: 3, erweiterung: false }, { motor: zaehlMotor(7) })
    expect(ergebnis).toMatchObject({ ausgang: 'beendet', schritte: 7 })
  })

  it('A10: eine Partie, die nicht endet, stösst an die Schrittgrenze', () => {
    const ergebnis = spieleDauerlaufPartie(
      { saat: 1, spielerzahl: 2, erweiterung: false },
      { motor: zaehlMotor(10_000), schrittGrenze: 25 },
    )
    expect(ergebnis).toMatchObject({ ausgang: 'schrittgrenze', schritte: 25 })
  })

  it('A4: eine verletzte Invariante hält den Lauf an und nennt sie', () => {
    const verliert = zaehlMotor(50, (zustand) => {
      if (zustand.zug.spielerIndex === 1) zustand.nachziehstapel.pop()
    })
    const ergebnis = spieleDauerlaufPartie({ saat: 2, spielerzahl: 2, erweiterung: true }, { motor: verliert })
    expect(ergebnis).toMatchObject({ ausgang: 'invariante', schritte: 1 })
    expect(ergebnis.detail).toMatch(/Jede Spielkarte liegt genau einmal an genau einem Ort/)
  })

  it('B2: eine aufgezählte, aber abgelehnte Aktion und ein Wurf der Engine werden gemeldet', () => {
    const lehntAb: Motor = { ...zaehlMotor(5), pruefe: () => ({ erlaubt: false, grund: 'passt nicht' }) }
    expect(spieleDauerlaufPartie({ saat: 3, spielerzahl: 2, erweiterung: false }, { motor: lehntAb })).toMatchObject({
      ausgang: 'abgelehnt',
      detail: expect.stringContaining('passt nicht'),
    })
    const wirft: Motor = {
      ...zaehlMotor(5),
      anwende: () => {
        throw new Error('kaputt')
      },
    }
    expect(spieleDauerlaufPartie({ saat: 3, spielerzahl: 2, erweiterung: false }, { motor: wirft })).toMatchObject({
      ausgang: 'fehler',
      detail: expect.stringContaining('kaputt'),
    })
  })

  it('B2: wirft das Aufzählen oder Prüfen, meldet der Lauf „fehler“ und prüft die übrigen Partien weiter', () => {
    const aufzaehlenWirft: Motor = {
      ...zaehlMotor(5),
      aktionen: () => {
        throw new Error('Aufzählung kaputt')
      },
    }
    const ergebnisse = dauerlauf(dauerlaufPartien(2, false), { motor: aufzaehlenWirft })
    expect(ergebnisse.map((ergebnis) => ergebnis.ausgang)).toEqual(['fehler', 'fehler'])
    expect(ergebnisse[0].detail).toContain('Aufzählung kaputt')
  })

  it('A4: ein Zustand, der Speichern und Laden nicht übersteht, wird gemeldet', () => {
    const ohneSpeichern = zaehlMotor(50, (zustand) => {
      ;(zustand as unknown as Record<string, unknown>).fremd = 1
    })
    expect(spieleDauerlaufPartie({ saat: 4, spielerzahl: 4, erweiterung: false }, { motor: ohneSpeichern })).toMatchObject({
      ausgang: 'speichern',
      schritte: 1,
    })
  })

  it('A10: gleiche Saat, gleicher Lauf', () => {
    const lauf = () => spieleDauerlaufPartie({ saat: 9, spielerzahl: 3, erweiterung: true }, { motor: zaehlMotor(4) })
    expect(lauf()).toEqual(lauf())
  })
})

describe('A10/D21: der Regelprüfer des Dauerlaufs selbst', () => {
  /** Ein Zustand mit `spieler` Spielern, Auslöser Spieler 0; nur die Felder, die der Prüfer liest. */
  function lage(spieler: number, amZug: number, zug: Partial<Spielzustand['zug']> = {}): Spielzustand {
    return {
      spieler: Array.from({ length: spieler }, () => ({ hand: [] })),
      schlussrundeAusloeser: 0,
      zug: { spielerIndex: amZug, gespielteFarbkarten: 0, gespielteSonderkarten: 0, zusatzaktionen: [], verwendet: [], runde: [], ...zug },
    } as unknown as Spielzustand
  }
  const ende: SpielAktion = { typ: 'ZugBeenden', spielerId: 'x' }

  function pruefeFolge(spieler: number, folge: AktionsErgebnis['ereignisse'][]): string | null {
    const pruefer = regelPruefer()
    for (const ereignisse of folge) {
      const befund = pruefer(lage(spieler, 0), ende, { zustand: lage(spieler, 0), ereignisse })
      if (befund !== null) return befund
    }
    return null
  }

  it('A10: kommt ein Spieler in der Schlussrunde zweimal dran und ein anderer gar nicht, meldet der Prüfer das', () => {
    const befund = pruefeFolge(4, [
      [{ typ: 'SchlussrundeBegonnen', ausloeser: 0 }, { typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 }],
      [{ typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 }],
      [{ typ: 'ZugBegonnen', spielerIndex: 2, teilzug: 1 }],
      [{ typ: 'PartieBeendet' }],
    ])
    expect(befund).toMatch(/A10/)
  })

  it('A7.8: ein zweiter Zug ohne Verdoppler im ersten Zug davor wird gemeldet; mit Verdoppler nicht, auch in der Schlussrunde', () => {
    const zweiter: AktionsErgebnis['ereignisse'] = [{ typ: 'ZugBegonnen', spielerIndex: 0, teilzug: 2 }]
    const ohne = lage(2, 0)
    expect(regelPruefer()(ohne, ende, { zustand: ohne, ereignisse: zweiter })).toMatch(/A7\.8/)
    const mit = lage(2, 0, { teilzug: 1, verdopplerGespielt: true, gespielteSonderkarten: 1 })
    const zaehler = neuerZugzaehler()
    const pruefer = regelPruefer(zaehler)
    expect(pruefer(mit, ende, { zustand: lage(2, 0), ereignisse: [{ typ: 'SchlussrundeBegonnen', ausloeser: 0 }, ...zweiter] })).toBeNull()
    expect(zaehler).toEqual({ zweite: 1, zweiteInSchlussrunde: 1, letzte: 0 })
  })

  it('D12/D46: zwei Farbkarten ohne Zusatzaktion meldet der Prüfer, mit einer freien Zusatzaktion nicht', () => {
    const zwei = [
      { art: 'Farbkarte', karteId: 'blau-01', kartenart: 'Farbkarte' as const },
      { art: 'Farbkarte', karteId: 'rot-01', kartenart: 'Farbkarte' as const },
    ]
    const ohne = lage(2, 0, { gespielteFarbkarten: 2, verwendet: zwei })
    expect(regelPruefer()(ohne, ende, { zustand: ohne, ereignisse: [] })).toMatch(/D12/)
    const mit = lage(2, 0, { gespielteFarbkarten: 2, verwendet: zwei, zusatzaktionen: [{ quelle: 'Comeback', erlaubt: ['Farbkarte'], nurKarten: null }] })
    expect(regelPruefer()(mit, ende, { zustand: mit, ereignisse: [] })).toBeNull()
  })

  it('D11: ein Verdoppler mit Wirkung im zweiten Zug wird gemeldet', () => {
    const zweiterZug = lage(2, 0, { teilzug: 2 })
    const aktion: SpielAktion = { typ: 'VerdopplerSpielen', spielerId: 'x', karteId: 'verdoppler-01' }
    expect(regelPruefer()(zweiterZug, aktion, { zustand: lage(2, 0), ereignisse: [] })).toMatch(/D11/)
  })

  it('D21: ein ausgesetzter letzter Zug zählt als sein letzter Zug', () => {
    const befund = pruefeFolge(3, [
      [{ typ: 'SchlussrundeBegonnen', ausloeser: 0 }, { typ: 'Ausgesetzt', spielerIndex: 1, karteId: 'schlangengrube-01', ablagestapelVon: 0 }, { typ: 'ZugBegonnen', spielerIndex: 2, teilzug: 1 }],
      [{ typ: 'PartieBeendet' }],
    ])
    expect(befund).toBeNull()
  })
})

describe('A5/A10/D12/D13: Dauerlauf über die Engine (E2, Plan 3.6 Punkt 7)', () => {
  const PARTIEN = [...dauerlaufPartien(150, false), ...dauerlaufPartien(150, true, 151)]

  it('A10/A7.8/A6/A7.6: 300 Zufallspartien mit 2, 3 und 4 Spielern und festen Saaten enden alle, ohne verletzte Invariante, mit echtem Verdoppler, echter Schlangengrube und echtem Farbenschutz', () => {
    expect(PARTIEN.map((partie) => partie.spielerzahl).filter((zahl) => zahl === 2)).toHaveLength(100)
    expect(PARTIEN.map((partie) => partie.spielerzahl).filter((zahl) => zahl === 4)).toHaveLength(100)
    const lauf = spieleGeprueft(PARTIEN, 0xfa15c4)
    const { ergebnisse, zuege, reaktionen } = lauf
    erwarteGeprueftenLauf(lauf, '300 Partien')
    // Jede Partie braucht mehrere Züge: mindestens eine Karte und „Zug beenden“ je Zug.
    expect(Math.min(...ergebnisse.map((ergebnis) => ergebnis.schritte))).toBeGreaterThan(40)
    // E3: Der Verdoppler wird wirklich gespielt, auch in der Schlussrunde.
    expect(zuege.zweite, 'zweite Züge nach einem Verdoppler im Dauerlauf').toBeGreaterThan(100)
    expect(zuege.zweiteInSchlussrunde, 'zweite Züge in der Schlussrunde im Dauerlauf').toBeGreaterThan(0)
    // E4: Gruben werden angesagt, abgewehrt, ausgesessen und gehen auch ohne Wirkung ab (D29).
    expect(reaktionen.KarteAngesagt, 'angesagte Gruben im Dauerlauf').toBeGreaterThan(300)
    expect(reaktionen.AbwehrGefragt, 'D33: jede Ansage fragt mindestens einen Betroffenen').toBeGreaterThanOrEqual(reaktionen.KarteAngesagt)
    expect(reaktionen.Abgewehrt, 'Abwehren mit Farbenschutz im Dauerlauf').toBeGreaterThan(30)
    expect(reaktionen.Ausgesetzt, 'ausgesetzte Züge im Dauerlauf').toBeGreaterThan(100)
    expect(reaktionen.GrubeOhneWirkung, 'Gruben ohne Wirkung im Dauerlauf (D29)').toBeGreaterThan(0)
  }, 600_000)
})

describe('A10: der lange Dauerlauf (E11, Kriterium 3, npm run test:dauerlauf)', () => {
  it('A10: die vier Teile sind zusammen 2000 Partien mit verschiedenen Saaten, je 1000 ohne und mit Erweiterung, reihum 2, 3 und 4 Spieler', () => {
    const alle = Array.from({ length: TEILE }, (_, index) => partienDesTeils(index + 1)).flat()
    expect(alle).toHaveLength(2000)
    expect(new Set(alle.map((partie) => partie.saat)).size, 'jede Saat einmal').toBe(2000)
    expect(alle.filter((partie) => partie.erweiterung)).toHaveLength(1000)
    expect(new Set(alle.map((partie) => partie.spielerzahl))).toEqual(new Set([2, 3, 4]))
    const dateien = readdirSync('src/engine/__tests__').filter((datei) => datei.endsWith('.dauerlauf.test.ts'))
    expect(dateien, 'je Teil eine Datei, die Vitest nebeneinander rechnet').toEqual(Array.from({ length: TEILE }, (_, index) => `dauerlauf_teil_${index + 1}.dauerlauf.test.ts`))
  })
})
