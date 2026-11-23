import { describe, expect, it } from 'vitest'
import { AUFGABENREGISTER } from '../../aufgabenKarten'
import { FARBEN } from '../../deck'
import { berechneEndwertung } from '../../index'
import type { Spielzustand } from '../../index'
import { legeAufgabenAus } from '../../testing/aufgaben'
import type { Aufgabenauslage } from '../../testing/aufgaben'
import type { Kartenwahl, Schlangenglied } from '../../testing/szenario'
import { istErfuellt, messePruefung, RB } from '../aufgaben_folgen_hilfen'
import { aufgabenEreignisse, aufgabeId, namen } from '../aufgaben_hilfen'
import { lege, schlangenNamen } from '../legen_hilfen'
import { jokerfarben } from '../wertung_hilfe'
import { aktionen, durchlassen, fuehreAus, tischMitHaenden, zugBeenden } from '../zugablauf_hilfen'

/*
X2, Kriterien 1 und 4 für die Aufgaben aus Paket B, im Ablauf des Rahmens (X1):
A9 „Wichtig für Sonderkarten“, A7.3 und A7.7: Ein Joker zählt bei jeder Aufgabe
als die Farbe, mit der sie erfüllt ist; diese Farbe ist nicht festgelegt, bei
einer anderen Aufgabe und bei der Wertung darf er anders zählen. Eine erfüllte
Aufgabe bleibt erfüllt (A7.3, D8). Dazu die Laufzeit der Prüfungen bei langen
Schlangen mit vielen Jokern.
*/

const FARBKARTEN: Kartenwahl[] = ['Rot', 'Gelb', 'Blau', 'Rot', 'Gelb']

/** Zwei Spieler mit Erweiterung; Spieler 1 ist am Zug, hat die Schlange `schlange-1` und hält eine Regenbogenschlange. */
function tisch(schlange: Schlangenglied[], offen: string[], hand1: Kartenwahl[] = FARBKARTEN): Spielzustand {
  const auslage: Aufgabenauslage = { offen, stapelOben: ['Gelber Schatz'], geheim: [[0, 'Schlangenmeister'], [1, 'Schlangenrepertoire']] }
  return tischMitHaenden([[RB, 'Rot', 'Gelb', 'Blau', 'Rot'], hand1], true)
    .schlange(0, schlange)
    .aendere((zustand) => legeAufgabenAus(zustand, auslage))
    .zustand()
}

/*
Rot, Gelb, Braun, Violett, Blau, ?, Blau, Grün, Rot, Blau, Grün: Für
Farbvielfalt muss an der Stelle ? Grün liegen (die Kette Rot … Blau, Grün), für
Schlangenbändiger Rot (das Muster Rot, Blau, Grün zweimal).
*/
const VOR = ['Rot', 'Gelb', 'Braun', 'Violett', 'Blau'] as const
const NACH = ['Blau', 'Grün', 'Rot', 'Blau', 'Grün'] as const

describe('A9/A7.3: derselbe Joker zählt bei zwei Aufgaben als verschiedene Farben (X2, Kriterium 1)', () => {
  it('A9: mit einer Farbkarte an der Stelle der Regenbogenschlange ist höchstens eine der beiden Aufgaben erfüllt', () => {
    for (const farbe of FARBEN) {
      const schlange: Schlangenglied[][] = [[...VOR, farbe, ...NACH]]
      const beide = [istErfuellt('Farbvielfalt', schlange), istErfuellt('Schlangenbändiger', schlange)]
      expect(beide, `A9: mit ${farbe} an Stelle 6 erwartet Farbvielfalt ${farbe === 'Grün'}, Schlangenbändiger ${farbe === 'Rot'}`).toEqual([farbe === 'Grün', farbe === 'Rot'])
    }
  })

  it('A9/A7.3: mit der Regenbogenschlange an dieser Stelle sind beide erfüllt: für Farbvielfalt als Grün, für Schlangenbändiger als Rot', () => {
    const schlange: Schlangenglied[][] = [[...VOR, RB, ...NACH]]
    expect(istErfuellt('Farbvielfalt', schlange), 'A9: Farbvielfalt mit der Regenbogenschlange als Grün').toBe(true)
    expect(istErfuellt('Schlangenbändiger', schlange), 'A9: Schlangenbändiger mit der Regenbogenschlange als Rot').toBe(true)
  })

  it('A9/X1: legt Spieler 1 die Regenbogenschlange dorthin, löst er beide offenen Aufgaben mit derselben Karte ein', () => {
    const start = tisch([...VOR, ...NACH], ['Farbvielfalt', 'Schlangenbändiger', 'Fusionsexperte'])
    const { zustand, ereignisse } = lege(start, 'RegenbogenschlangeLegen', RB, 'schlange-1', VOR.length)
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbvielfalt', 'Schlangenbändiger'])
    expect(aufgabenEreignisse(ereignisse).filter((ereignis) => ereignis.typ === 'AufgabeErfuellt')).toEqual([
      { typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId('Farbvielfalt') },
      { typ: 'AufgabeErfuellt', spielerIndex: 0, aufgabeId: aufgabeId('Schlangenbändiger') },
    ])
  })
})

describe('A9/A7.3: eine erfüllte Aufgabe bleibt erfüllt, auch wenn der Joker später anders zählt (X2, Kriterium 4)', () => {
  /** Blau, Rot, Gelb, Braun, Grün, Grün; die Regenbogenschlange kommt zwischen Braun und Grün. */
  function eingeloest(): Spielzustand {
    const start = tisch(['Blau', 'Rot', 'Gelb', 'Braun', 'Grün', 'Grün'], ['Farbvielfalt', 'Fusionsexperte', 'Schlangentanz'], ['Schlangenblockade', ...FARBKARTEN.slice(1)])
    const { zustand } = lege(start, 'RegenbogenschlangeLegen', RB, 'schlange-1', 4)
    expect(namen(zustand.spieler[0].erfuellteAufgaben), 'A9/A7.3: Farbvielfalt mit der Regenbogenschlange als Violett').toEqual(['Farbvielfalt'])
    return zustand
  }

  it('A11/A7.3: in der Wertung zählt die Regenbogenschlange als Grün (Grün-Gruppe, 6 Punkte); Farbvielfalt zählt trotzdem 9 Punkte', () => {
    const wertung = berechneEndwertung(eingeloest()).spieler[0]
    expect(jokerfarben(wertung), 'A11: die Regenbogenschlange zählt in der Wertung als Grün').toEqual(['Grün'])
    expect(wertung.gruppenPunkte).toBe(6)
    expect(wertung.aufgaben?.map((aufgabe) => [aufgabe.name, aufgabe.punkte])).toEqual([['Farbvielfalt', 9]])
  })

  it('A9/A7.5: unterbricht KI-Gegner 1 die Kette danach mit einer Schlangenblockade, bleibt Farbvielfalt bei Spieler 1', () => {
    const vorher = eingeloest()
    const naechster = fuehreAus(vorher, zugBeenden(vorher)).zustand
    const blockade = aktionen(naechster, 'BlockadeLegen').find((aktion) => aktion.typ === 'BlockadeLegen' && aktion.schlangenId === 'schlange-1' && aktion.position === 3)
    expect(blockade, 'BlockadeLegen in schlange-1 an Stelle 3 ist nicht aufgezählt').toBeDefined()
    const angesagt = fuehreAus(naechster, blockade!).zustand
    const { zustand } = fuehreAus(angesagt, durchlassen(angesagt))
    expect(schlangenNamen(zustand, 0)).toEqual(['Blau', 'Rot', 'Gelb', 'Schlangenblockade', 'Braun', RB, 'Grün', 'Grün'])
    expect(AUFGABENREGISTER.get('Farbvielfalt')!.istErfuellt(zustand, 0), 'A9: die Bedingung gilt nicht mehr').toBe(false)
    expect(namen(zustand.spieler[0].erfuellteAufgaben), 'A9: die erfüllte Aufgabe bleibt beim Spieler').toEqual(['Farbvielfalt'])
    expect(berechneEndwertung(zustand).spieler[0].aufgabenPunkte).toBe(9)
  })
})

/** 20 Karten, davon 2 Regenbogenschlangen und 2 Farbenfusionen. */
const LANG_4: Schlangenglied[] = ['Blau', 'Blau', 'Rot', 'Rot', RB, 'Gelb', 'Gelb', { fusion: ['Grün', 'Grün'] }, 'Braun', 'Braun', 'Violett', 'Violett', RB, 'Blau', 'Blau', { fusion: ['Rot', 'Rot'] }, 'Gelb', 'Gelb', 'Braun', 'Braun']
/** 20 Karten mit 8 Jokern: alle 4 Regenbogenschlangen und alle 4 Farbenfusionen. */
const LANG_8: Schlangenglied[] = [RB, 'Blau', { fusion: ['Rot', 'Rot'] }, 'Blau', RB, 'Gelb', { fusion: ['Gelb', 'Gelb'] }, 'Braun', RB, 'Braun', { fusion: ['Violett', 'Violett'] }, 'Violett', RB, 'Blau', { fusion: ['Grün', 'Grün'] }, 'Blau', 'Braun', 'Braun', 'Gelb', 'Gelb']

describe('A9/X2: Laufzeit der Prüfungen bei 20 Karten', () => {
  const FAELLE: Array<[string, Schlangenglied[][]]> = [
    ['Farbvielfalt', [LANG_4]],
    ['Farbwechsler', [LANG_4]],
    ['Schlangenbändiger', [LANG_4]],
    ['Symmetriemeister', [LANG_4]],
    ['Vielfaltskönig', [LANG_4.slice(0, 10), LANG_4.slice(10)]],
    ['Farbvielfalt', [LANG_8]],
    ['Farbwechsler', [LANG_8]],
    ['Schlangenbändiger', [LANG_8]],
    ['Symmetriemeister', [LANG_8]],
    ['Vielfaltskönig', [LANG_8.slice(0, 10), LANG_8.slice(10)]],
  ]

  it.each(FAELLE)('A9 %s: eine Prüfung bei 20 Karten mit 4 oder 8 Jokern dauert unter 5 ms', (name, schlangen) => {
    const { median, langsamste } = messePruefung(name, schlangen)
    expect(median, `${name}.istErfuellt: Median von 51 Prüfungen ${median.toFixed(3)} ms (langsamste ${langsamste.toFixed(3)} ms), erwartet unter 5 ms`).toBeLessThan(5)
  })
})
