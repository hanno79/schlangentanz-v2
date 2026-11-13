// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { abschnittA, antwortD, stehtImSatz, zeilenOhneAuszeichnung } from '../../test/specText'
import { ZUGSCHRITTE } from './zugschritte'

/*
O9, Kriterium 2: `/regeln` fasst einen Zug in fünf Schritten zusammen und
behauptet dabei nichts, was nicht in Teil A oder D steht (U2).

Prüfbar gemacht ist das so: Jeder Satz der Zusammenfassung nennt seine Quelle
und steht dort wörtlich. Erlaubt sind nur ein fehlender Punkt am Ende und ein
anders geschriebener erster Buchstabe, wie sie beim Herauslösen eines Satzes
entstehen. Ein Satz aus Teil D ist eine Ergänzung des Autors, die noch nicht auf
der Website steht; die Oberfläche kennzeichnet ihn (`Regeln.test.tsx`).
*/

const ALLE_SAETZE = ZUGSCHRITTE.flatMap((schritt) => schritt.saetze.map((satz) => [schritt.titel, satz] as const))

describe('O9: Ein Zug in fünf Schritten (Kriterium 2)', () => {
  it('O9/A5: es sind genau fünf Schritte, jeder mit Titel und mindestens einem Satz', () => {
    expect(ZUGSCHRITTE, 'Zahl der Schritte').toHaveLength(5)
    for (const schritt of ZUGSCHRITTE) {
      expect(schritt.titel.length, 'Titel eines Schritts').toBeGreaterThan(0)
      expect(schritt.saetze.length, `Sätze in „${schritt.titel}“`).toBeGreaterThan(0)
    }
  })

  it('O9/A5: die Schritte folgen dem Zugablauf der Website: zuerst die Hand, zuletzt Zug beenden', () => {
    expect(ZUGSCHRITTE[0].titel, 'erster Schritt').toBe('Kartenhand prüfen')
    expect(ZUGSCHRITTE[1].titel, 'zweiter Schritt').toBe('Karten ausspielen')
    expect(ZUGSCHRITTE[4].titel, 'letzter Schritt').toBe('Zug beenden')
  })

  it('O9/A5: „Aufgabe erfüllen“ gilt nur mit Erweiterung und ist so gekennzeichnet', () => {
    const aufgabe = ZUGSCHRITTE.find((schritt) => schritt.titel === 'Aufgabe erfüllen')
    expect(aufgabe?.nurErweiterung, '„Aufgabe erfüllen“ nur mit Erweiterung').toBe(true)
    expect(ZUGSCHRITTE.filter((schritt) => schritt.nurErweiterung), 'Schritte nur mit Erweiterung').toHaveLength(1)
  })

  it.each(ALLE_SAETZE.filter(([, satz]) => satz.quelle.startsWith('A')))(
    'O9/U2: „%s“: Satz aus Teil A steht wörtlich in seiner Quelle: %j',
    (_, satz) => {
      const zeilen = zeilenOhneAuszeichnung(abschnittA(satz.quelle))
      expect(stehtImSatz(satz.text, zeilen), `${satz.quelle} enthält nicht: ${satz.text}`).toBe(true)
    },
  )

  it.each(ALLE_SAETZE.filter(([, satz]) => satz.quelle.startsWith('D')))(
    'O9/U2: „%s“: Ergänzung aus Teil D steht wörtlich in der Antwort des Autors: %j',
    (_, satz) => {
      expect(stehtImSatz(satz.text, [antwortD(satz.quelle)]), `${satz.quelle} enthält nicht: ${satz.text}`).toBe(true)
    },
  )

  it('O9/U2: jeder Satz nennt Teil A oder Teil D als Quelle, sonst nichts', () => {
    const ohneQuelle = ALLE_SAETZE.filter(([, satz]) => !/^(A\d+(\.\d+)?|D\d+)$/.test(satz.quelle))
    expect(ohneQuelle, 'Sätze ohne Quelle in Teil A oder D').toEqual([])
  })

  it('O9/D12, D13: wo Teil D die Website ergänzt, folgt die Zusammenfassung Teil D', () => {
    const quellen = ALLE_SAETZE.map(([, satz]) => satz.quelle)
    expect(quellen, 'Pflichtkarte: mindestens 1, höchstens 2 Karten (D12)').toContain('D12')
    expect(quellen, 'Sonderkarte ohne Ziel wirkungslos ablegen (D13)').toContain('D13')
  })
})
