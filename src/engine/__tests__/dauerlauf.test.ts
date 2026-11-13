import { describe, expect, it } from 'vitest'
import type { AktionsErgebnis, SpielAktion, Spielzustand } from '../index'
import { ENGINE_MOTOR, dauerlauf, dauerlaufPartien, spieleDauerlaufPartie } from '../testing/dauerlauf'
import type { Motor } from '../testing/dauerlauf'

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

  it('A5: nach E1 bleibt jede Partie am Anfang stehen, weil die Engine noch keine Aktion aufzählt', () => {
    const ergebnisse = dauerlauf([...dauerlaufPartien(3, false), ...dauerlaufPartien(3, true)])
    for (const ergebnis of ergebnisse) {
      expect(ergebnis).toMatchObject({ ausgang: 'festgefahren', schritte: 0 })
      expect(ergebnis.detail).toMatch(/keine Aktion/)
    }
    expect(ENGINE_MOTOR.aktionen).toBeTypeOf('function')
  })

  it('A10: eine Partie, die endet, meldet „beendet“ mit der Zahl der Schritte', () => {
    const ergebnis = spieleDauerlaufPartie({ saat: 1, spielerzahl: 3, erweiterung: false }, { motor: zaehlMotor(7) })
    expect(ergebnis).toMatchObject({ ausgang: 'beendet', schritte: 7 })
  })

  it('A10: eine Partie, die nicht endet, stößt an die Schrittgrenze', () => {
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
