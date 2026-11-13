import { describe, expect, it } from 'vitest'
import type { AktionsErgebnis, SpielAktion, Spielzustand } from '../index'
import { ENGINE_MOTOR, dauerlauf, dauerlaufPartien, spieleDauerlaufPartie } from '../testing/dauerlauf'
import type { Motor, SchrittPruefer } from '../testing/dauerlauf'

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

/**
 * Was der Dauerlauf je Partie zusätzlich zu den Invarianten prüft (E2): höchstens
 * eine Farbkarte und eine Sonderkarte je Zug (D12), höchstens 5 Handkarten nach
 * dem eigenen Zugende (A5), in der Schlussrunde zieht niemand, der Auslöser kommt
 * nicht mehr dran, und jeder andere hat genau einen letzten Zug (A10).
 */
function regelPruefer(): SchrittPruefer {
  let schlusszuege: number | null = null
  return (vorher, _aktion, { zustand, ereignisse }) => {
    const { zug } = zustand
    if (zug.gespielteFarbkarten > 1 || zug.gespielteSonderkarten > 1) return `D12: ${JSON.stringify(zug)}`
    for (const ereignis of ereignisse) {
      if (ereignis.typ === 'SchlussrundeBegonnen') schlusszuege = 0
      else if (schlusszuege === null) continue
      else if (ereignis.typ === 'KartenGezogen') return `A10: In der Schlussrunde zieht ${ereignis.spielerIndex} Karten.`
      else if (ereignis.typ === 'ZugBegonnen' && ereignis.spielerIndex === zustand.schlussrundeAusloeser) return 'A10: Der Auslöser ist noch einmal dran.'
      else if (ereignis.typ === 'ZugBegonnen') schlusszuege += 1
      else if (ereignis.typ === 'PartieBeendet' && schlusszuege !== zustand.spieler.length - 1) {
        return `A10: ${schlusszuege} statt ${zustand.spieler.length - 1} letzte Züge.`
      }
    }
    const zugende = ereignisse.some((ereignis) => ereignis.typ === 'ZugBegonnen' || ereignis.typ === 'PartieBeendet')
    const hand = zustand.spieler[vorher.zug.spielerIndex].hand.length
    return zugende && hand > 5 ? `A5: Nach dem Zugende hält Spieler ${vorher.zug.spielerIndex} ${hand} Karten.` : null
  }
}

describe('A10/D21: der Regelprüfer des Dauerlaufs selbst', () => {
  /** Ein Zustand mit `spieler` Spielern, Auslöser Spieler 0; nur die Felder, die der Prüfer liest. */
  function lage(spieler: number, amZug: number): Spielzustand {
    return {
      spieler: Array.from({ length: spieler }, () => ({ hand: [] })),
      schlussrundeAusloeser: 0,
      zug: { spielerIndex: amZug, gespielteFarbkarten: 0, gespielteSonderkarten: 0 },
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

  it('D21: ein ausgesetzter letzter Zug zählt als sein letzter Zug', () => {
    const befund = pruefeFolge(3, [
      [{ typ: 'SchlussrundeBegonnen', ausloeser: 0 }, { typ: 'Ausgesetzt', spielerIndex: 1 }, { typ: 'ZugBegonnen', spielerIndex: 2, teilzug: 1 }],
      [{ typ: 'PartieBeendet' }],
    ])
    expect(befund).toBeNull()
  })
})

describe('A5/A10/D12/D13: Dauerlauf über die Engine (E2)', () => {
  const PARTIEN = [...dauerlaufPartien(150, false), ...dauerlaufPartien(150, true, 151)]

  it('A10: 300 Zufallspartien mit 2, 3 und 4 Spielern und festen Saaten enden alle, ohne verletzte Invariante', () => {
    expect(PARTIEN.map((partie) => partie.spielerzahl).filter((zahl) => zahl === 2)).toHaveLength(100)
    expect(PARTIEN.map((partie) => partie.spielerzahl).filter((zahl) => zahl === 4)).toHaveLength(100)
    const ergebnisse = dauerlauf(PARTIEN, { neuerPruefer: regelPruefer })
    expect(ergebnisse.filter((ergebnis) => ergebnis.ausgang !== 'beendet')).toEqual([])
    // Jede Partie braucht mehrere Züge: mindestens eine Karte und „Zug beenden“ je Zug.
    expect(Math.min(...ergebnisse.map((ergebnis) => ergebnis.schritte))).toBeGreaterThan(40)
  }, 300_000)
})
