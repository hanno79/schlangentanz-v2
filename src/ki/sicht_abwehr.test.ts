import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen } from '../engine'
import type { Ereignis, SpielAktion, Spielzustand } from '../engine'
import { baukasten } from '../engine/testing/szenario'
import type { Kartenwahl } from '../engine/testing/szenario'
import { erstelleZufallsKi } from './zufallsKi'
import { naechsterKiSchritt } from './schritt'
import { entscheiderVon, sichtFuer } from './sicht'

/*
E4 mit D33 (Entscheidung des Autors vom 21.11.2026): Gefragt wird jeder
Betroffene; abwehren kann nur, wer Farbenschutz hält. Wer gefragt wird, verrät
deshalb nichts (B2): Für den Angreifer und alle Unbeteiligten sehen Ereignisse,
Sicht und Entscheiderfolge gleich aus, ob der Betroffene Farbenschutz hält und
durchlässt oder keinen hält.
*/

const MIT_GRUBE: Kartenwahl[] = ['Schlangengrube', 'Blau', 'Rot', 'Gelb', 'Grün']
const MIT_SCHUTZ: Kartenwahl[] = ['Farbenschutz', 'Blau', 'Rot', 'Gelb', 'Grün']
const OHNE_SCHUTZ: Kartenwahl[] = ['Violett', 'Blau', 'Rot', 'Gelb', 'Grün']

/** Vier Spieler: Spieler 1 greift Spieler 2 mit einer Schlangengrube an; Spieler 3 und 4 sind unbeteiligt. */
function tisch(betroffener: Kartenwahl[]): Spielzustand {
  return baukasten({ spielerzahl: 4, erweiterung: false })
    .hand(0, MIT_GRUBE)
    .hand(1, betroffener)
    .hand(2, ['Blau', 'Rot', 'Gelb', 'Braun', 'Violett'])
    .hand(3, ['Rot', 'Gelb', 'Blau', 'Braun', 'Violett'])
    .zustand()
}

type Wahl = (aktion: SpielAktion) => boolean
const WAHLEN: Wahl[] = [
  (aktion) => aktion.typ === 'SchlangengrubeSpielen' && aktion.zielSpielerId === 'spieler-2',
  (aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId === null,
  (aktion) => aktion.typ === 'FarbkarteLegen',
  (aktion) => aktion.typ === 'ZugBeenden',
]

/** Was Angreifer und Unbeteiligte nach jedem Schritt erfahren: Ereignisse, ihre Sichten, wer entscheidet. */
function beobachtet(start: Spielzustand): Array<{ ereignisse: Ereignis[]; sichten: unknown[]; entscheider: unknown }> {
  let zustand = start
  return WAHLEN.map((wahl) => {
    const aktion = ermittleAktionen(zustand).find(wahl)
    if (aktion === undefined) throw new Error(`Testaufbau: keine passende Aktion unter ${JSON.stringify(ermittleAktionen(zustand))}`)
    const schritt = anwendeAktion(zustand, aktion)
    zustand = schritt.zustand
    return { ereignisse: schritt.ereignisse, sichten: [0, 2, 3].map((ich) => sichtFuer(zustand, ich)), entscheider: entscheiderVon(zustand) }
  })
}

describe('B2/D33: wer gefragt wird, verrät keinen Farbenschutz', () => {
  it('B2/D33: Ereignisse, Sicht von Angreifer und Unbeteiligten und Entscheiderfolge sind gleich, ob der Betroffene Farbenschutz hält und durchlässt oder keinen hält', () => {
    const mitSchutz = beobachtet(tisch(MIT_SCHUTZ))
    expect(mitSchutz).toEqual(beobachtet(tisch(OHNE_SCHUTZ)))
    expect(mitSchutz[0].entscheider, 'D33: nach der Ansage ist der Betroffene gefragt').toMatchObject({ index: 1 })
  })

  it('D33: eine KI ohne Farbenschutz wird gefragt, hat nur „durchlassen“, und die Zufalls-KI wählt es; danach geht es weiter', () => {
    let zustand = tisch(OHNE_SCHUTZ)
    zustand = anwendeAktion(zustand, ermittleAktionen(zustand).find(WAHLEN[0])!).zustand
    expect(ermittleAktionen(zustand)).toEqual([{ typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: null }])
    const schritt = naechsterKiSchritt(zustand, erstelleZufallsKi(() => 0.99))
    expect(schritt).toEqual({ typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: null })
    const nach = anwendeAktion(zustand, schritt!).zustand
    expect(nach.schwebend).toBeNull()
    expect(entscheiderVon(nach)).toMatchObject({ index: 0 })
  })
})
