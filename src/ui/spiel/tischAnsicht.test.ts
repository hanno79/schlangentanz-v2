import { describe, expect, it } from 'vitest'
import { berechneFarbgruppenPunkte } from '../../engine'
import type { Spielzustand } from '../../engine'
import { erzeugeZufall } from '../../engine/testing/zufall'
import { zufallszustand } from '../../engine/testing/zufallszustand'
import { TISCH_SZENARIEN, angriffAufMich, geheimeHaende, mittelspiel, verborgeneIds, volltisch } from '../tisch/__tests__/szenarien'
import { tischAnsicht } from './tischAnsicht'

/*
O4 (statischer Teil von `tischAnsicht`, O3 baut weiter): Aus dem vollen
Zustand wird, was der Mensch am Tisch sehen darf. Der Tisch zeichnet nur diese
Sicht; was hier fehlt, kann er nicht verraten (B2, Plan O4 Kriterium 2).
*/

const ZUFALLSSAATEN = Array.from({ length: 120 }, (_, index) => index + 1)

function alleZustaende(): { name: string; zustand: Spielzustand }[] {
  return [
    ...TISCH_SZENARIEN.map((szenario) => ({ name: szenario.name, zustand: szenario.erzeuge() })),
    ...ZUFALLSSAATEN.map((saat) => ({ name: `zufallszustand ${saat}`, zustand: zufallszustand(erzeugeZufall(saat)) })),
  ]
}

describe('O4/B2: Die Sicht verrät keine verdeckte Information', () => {
  it('O4 K2/B2: keine fremde Handkarte und keine fremde geheime Aufgabe, in jedem Szenario und 120 Zufallszuständen', () => {
    for (const { name, zustand } of alleZustaende()) {
      const text = JSON.stringify(tischAnsicht(zustand))
      const verraten = verborgeneIds(zustand).filter((id) => text.includes(`"${id}"`))
      expect(verraten, `tischAnsicht(${name}) enthält verborgene Ids`).toEqual([])
    }
  })

  it('O4/A5: von den Gegnern steht nur die Zahl der Handkarten in der Sicht', () => {
    const zustand = geheimeHaende()
    const ansicht = tischAnsicht(zustand)
    expect(ansicht.gegner.map((gegner) => gegner.handkarten)).toEqual([5, 5])
    for (const gegner of ansicht.gegner) {
      expect(Object.keys(gegner), `Gegner ${gegner.name}: Felder der Sicht`).not.toContain('hand')
      expect(Object.keys(gegner), `Gegner ${gegner.name}: Felder der Sicht`).not.toContain('geheimeAufgabe')
    }
  })

  it('O4: die eigene Hand und die eigene geheime Aufgabe stehen vollständig in der Sicht', () => {
    const zustand = geheimeHaende()
    const ansicht = tischAnsicht(zustand)
    expect(ansicht.ich.hand.map((karte) => karte.id)).toEqual(zustand.spieler[0].hand.map((karte) => karte.id))
    expect(ansicht.ich.geheimeAufgabe?.id).toBe(zustand.spieler[0].geheimeAufgabe?.id)
  })
})

describe('O4: Feste Sicht, der Mensch sitzt unten', () => {
  it('O4: der Mensch ist „ich“, die Gegner folgen in Sitzordnung', () => {
    const ansicht = tischAnsicht(volltisch())
    expect(ansicht.ich.name).toBe('Spieler 1')
    expect(ansicht.gegner.map((gegner) => gegner.name)).toEqual(['KI-Gegner 1', 'KI-Gegner 2', 'KI-Gegner 3'])
  })

  it('O4/A5: sitzt der Mensch nicht vorn, beginnen die Gegner links von ihm im Uhrzeigersinn', () => {
    const zustand = volltisch()
    zustand.spieler[0].steuerung = 'KI'
    zustand.spieler[2].steuerung = 'Mensch'
    const ansicht = tischAnsicht(zustand)
    expect(ansicht.ich.name).toBe('KI-Gegner 2')
    expect(ansicht.gegner.map((gegner) => gegner.name)).toEqual(['KI-Gegner 3', 'Spieler 1', 'KI-Gegner 1'])
  })

  it('O4/B2: ohne genau einen Menschen am Tisch gibt es keine Sicht, sondern einen Fehler', () => {
    const zustand = volltisch()
    zustand.spieler[0].steuerung = 'KI'
    expect(() => tischAnsicht(zustand)).toThrow(/Mensch/)
    zustand.spieler[0].steuerung = 'Mensch'
    zustand.spieler[1].steuerung = 'Mensch'
    expect(() => tischAnsicht(zustand)).toThrow(/Mensch/)
  })

  it('O4/A4: Nachziehstapel als Zahl, offene Aufgaben nur mit Erweiterung', () => {
    const voll = tischAnsicht(volltisch())
    expect(voll.nachziehstapel).toBe(0)
    expect(voll.erweiterung).toBe(true)
    expect(voll.offeneAufgaben).toHaveLength(3)

    const zustand = mittelspiel()
    const mitte = tischAnsicht(zustand)
    expect(mitte.nachziehstapel).toBe(zustand.nachziehstapel.length)
    expect(mitte.nachziehstapel).toBeGreaterThan(0)
    expect(mitte.offeneAufgaben).toEqual([])
  })

  it('O4/A4: Ablagestapel mit Anzahl und oberster Karte, leer ohne Karte', () => {
    const ansicht = tischAnsicht(mittelspiel())
    const [ki1, ki2] = ansicht.gegner
    expect(ki1.ablage.anzahl).toBe(2)
    expect(ki1.ablage.oben).toMatchObject({ typ: 'Farbkarte', farbe: 'Rot' })
    expect(ki2.ablage).toEqual({ anzahl: 0, oben: null })
    expect(ansicht.ich.ablage.oben).toMatchObject({ typ: 'Sonderkarte', name: 'Schlangenfrass' })
  })
})

describe('O4 K4: Farbgruppen, Fusion und Grube', () => {
  it('O4 K4/A11: die markierten Farbgruppen sind genau die der Wertung der Engine', () => {
    const zustand = volltisch()
    const ansicht = tischAnsicht(zustand)
    const ansichtSchlangen = [ansicht.ich, ...ansicht.gegner].flatMap((platz) => platz.schlangen)
    const zustandSchlangen = zustand.spieler.flatMap((spieler) => spieler.schlangen)
    expect(ansichtSchlangen).toHaveLength(8)
    for (const schlange of zustandSchlangen) {
      const gesehen = ansichtSchlangen.find((eintrag) => eintrag.id === schlange.id)
      expect(gesehen, `Schlange ${schlange.id} fehlt in der Sicht`).toBeDefined()
      const markiert = gesehen!.karten.filter((eintrag) => eintrag.gruppe !== null).map((eintrag) => eintrag.karte.id)
      const erwartet = berechneFarbgruppenPunkte(schlange).gruppen.flatMap((gruppe) => gruppe.kartenIds)
      expect(markiert, `Schlange ${schlange.id}: Karten in Farbgruppen`).toEqual(erwartet)
      expect(gesehen!.farbgruppen).toEqual(berechneFarbgruppenPunkte(schlange).gruppen.map(({ farbe, laenge }) => ({ farbe, laenge })))
    }
  })

  it('O4 K4/A7.3: die Regenbogenschlange schliesst eine rote Gruppe; Anfang und Ende jeder Gruppe sind markiert', () => {
    const [ersteSchlange] = tischAnsicht(volltisch()).ich.schlangen
    // Blau Blau Blau | Rot Rot Regenbogen Rot | Gelb Gelb Gelb | Violett
    expect(ersteSchlange.karten.map((eintrag) => eintrag.gruppe?.farbe ?? null)).toEqual([
      'Blau', 'Blau', 'Blau', 'Rot', 'Rot', 'Rot', 'Rot', 'Gelb', 'Gelb', 'Gelb', null,
    ])
    expect(ersteSchlange.karten.map((eintrag) => (eintrag.gruppe?.anfang ? 'A' : '') + (eintrag.gruppe?.ende ? 'E' : ''))).toEqual([
      'A', '', 'E', 'A', '', '', 'E', 'A', '', 'E', '',
    ])
  })

  it('O4 K4/A7.7: die Farbenfusion trägt die zwei Farbkarten darunter und zählt in der blauen Gruppe', () => {
    const [, zweite] = tischAnsicht(mittelspiel()).ich.schlangen
    expect(zweite.karten.map((eintrag) => (eintrag.karte.typ === 'Farbkarte' ? eintrag.karte.farbe : eintrag.karte.name))).toEqual([
      'Blau', 'Farbenfusion', 'Blau',
    ])
    const fusion = zweite.karten[1]
    expect(fusion.unter?.map((karte) => karte.farbe)).toEqual(['Gelb', 'Gelb'])
    expect(zweite.karten.map((eintrag) => eintrag.gruppe?.farbe)).toEqual(['Blau', 'Blau', 'Blau'])
    expect(zweite.karten[0].unter).toBeNull()
  })

  it('O4 K4/A7.6: eine ausliegende Schlangengrube liegt beim getroffenen Spieler und nennt, wer sie gespielt hat', () => {
    const ansicht = tischAnsicht(mittelspiel())
    const [ki1, ki2] = ansicht.gegner
    expect(ki1.gruben).toEqual([])
    expect(ansicht.ich.gruben).toEqual([])
    expect(ki2.gruben).toHaveLength(1)
    expect(ki2.gruben[0].karte.name).toBe('Schlangengrube')
    expect(ki2.gruben[0].von).toEqual({ name: 'Spieler 1', ich: true })
  })
})

describe('O4: Statuszeile — wer ist dran, was steht an', () => {
  it('O4: im Volltisch ist KI-Gegner 2 am Zug, in der Schlussrunde', () => {
    const { status, gegner, ich } = tischAnsicht(volltisch())
    expect(status.amZug).toEqual({ name: 'KI-Gegner 2', ich: false })
    expect(status.partiephase).toBe('Schlussrunde')
    expect(status.schwebend).toBeNull()
    expect(gegner.map((eintrag) => eintrag.amZug)).toEqual([false, true, false])
    expect(ich.amZug).toBe(false)
  })

  it('O4/A6: schwebt eine Sonderkarte über dem Menschen, entscheidet er', () => {
    const { status } = tischAnsicht(angriffAufMich())
    expect(status.schwebend).toEqual({
      karte: 'Schlangengrube',
      von: { name: 'KI-Gegner 1', ich: false },
      entscheidet: { name: 'Spieler 1', ich: true },
    })
  })

  it('O4/A5: Teilzug und Abschnitt kommen aus dem Zustand', () => {
    const zustand = mittelspiel()
    zustand.zug = { ...zustand.zug, teilzug: 2, abschnitt: 'Abwerfen' }
    const { status } = tischAnsicht(zustand)
    expect(status).toMatchObject({ amZug: { name: 'Spieler 1', ich: true }, teilzug: 2, abschnitt: 'Abwerfen', partiephase: 'Laufend' })
  })
})
