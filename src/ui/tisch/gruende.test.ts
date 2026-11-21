import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider, pruefeAktion } from '../../engine'
import type { Ablehnung, Spielergrund, SpielAktion, Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { erzeugeZufall } from '../../engine/testing/zufall'
import { zufallszustand } from '../../engine/testing/zufallszustand'
import type { Person } from '../spiel/tischAnsicht'
import { tischAnsicht } from '../spiel/tischAnsicht'
import { DU_FORM, grundFuerDich } from './gruende'

/*
O6, Weg A: Die Engine nennt in einer Ablehnung die Art und die Werte, die
Oberfläche spricht dich darin mit „du“ an. Gründe, die dich nicht nennen,
stehen wörtlich da, wie die Engine sie schreibt.
*/

const PERSONEN: Person[] = [
  { name: 'Spieler 1', ich: true },
  { name: 'KI-Gegner 1', ich: false },
  { name: 'KI-Gegner 2', ich: false },
]
const person = (index: number) => PERSONEN[index]
const ablehnung = (grund: string, nennt?: Spielergrund): Ablehnung => (nennt === undefined ? { erlaubt: false, grund } : { erlaubt: false, grund, nennt })

describe('O6 (Weg A): Gründe in Du-Form', () => {
  it.each<[string, Spielergrund, string, string]>([
    ['entscheidetNicht, du', { art: 'entscheidetNicht', spielerIndex: 0, entscheider: 1 }, 'Spieler 1 entscheidet gerade nicht; dran ist KI-Gegner 1 (A6).', 'Du entscheidest gerade nicht; dran ist KI-Gegner 1 (A6).'],
    ['entscheidetNicht, du entscheidest', { art: 'entscheidetNicht', spielerIndex: 1, entscheider: 0 }, 'KI-Gegner 1 entscheidet gerade nicht; dran ist Spieler 1 (A6).', 'KI-Gegner 1 entscheidet gerade nicht; dran bist du (A6).'],
    ['nichtAmZug, du', { art: 'nichtAmZug', spielerIndex: 0, amZug: 2 }, 'Spieler 1 ist nicht am Zug; am Zug ist KI-Gegner 2 (A5).', 'Du bist nicht am Zug; am Zug ist KI-Gegner 2 (A5).'],
    ['nichtAmZug, du bist am Zug', { art: 'nichtAmZug', spielerIndex: 1, amZug: 0 }, 'KI-Gegner 1 ist nicht am Zug; am Zug ist Spieler 1 (A5).', 'KI-Gegner 1 ist nicht am Zug; am Zug bist du (A5).'],
    ['nichtAmZug, niemand', { art: 'nichtAmZug', spielerIndex: 0, amZug: null }, 'Spieler 1 ist nicht am Zug; am Zug ist niemand (A5).', 'Du bist nicht am Zug; am Zug ist niemand (A5).'],
    ['kartenpflicht', { art: 'kartenpflicht', spielerIndex: 0 }, 'Spieler 1 muss erst mindestens eine Karte spielen; beenden ohne Karte geht nur mit leerer Hand (A5, D12).', 'Du musst erst mindestens eine Karte spielen; beenden ohne Karte geht nur mit leerer Hand (A5, D12).'],
    ['nichtAufHand', { art: 'nichtAufHand', spielerIndex: 0, karteId: 'rot-99' }, 'Die Karte rot-99 liegt nicht auf der Hand von Spieler 1.', 'Die Karte rot-99 liegt nicht auf deiner Hand.'],
    ['abwerfenAnzahl', { art: 'abwerfenAnzahl', spielerIndex: 0, haelt: 7, abwerfen: 2, genannt: 1 }, 'Spieler 1 hält 7 Karten und legt genau 2 Karten ab, nicht 1 (A5).', 'Du hältst 7 Karten und legst genau 2 Karten ab, nicht 1 (A5).'],
  ])('O6: %s', (_fall, nennt, grund, erwartet) => {
    expect(grundFuerDich(ablehnung(grund, nennt), person)).toBe(erwartet)
  })

  it('O6: nennt der Grund nur KI-Gegner, steht er wörtlich da', () => {
    const grund = 'KI-Gegner 1 ist nicht am Zug; am Zug ist KI-Gegner 2 (A5).'
    expect(grundFuerDich(ablehnung(grund, { art: 'nichtAmZug', spielerIndex: 1, amZug: 2 }), person)).toBe(grund)
  })

  it('O6: ein Grund ohne Spieler steht wörtlich da', () => {
    const grund = 'Der Farbendieb schwebt noch: Erst entscheiden die Betroffenen, ob sie abwehren (A6).'
    expect(grundFuerDich(ablehnung(grund), person)).toBe(grund)
  })

  it('O6: jede Art hat eine Du-Form', () => {
    expect(Object.keys(DU_FORM).sort()).toEqual(['abwerfenAnzahl', 'entscheidetNicht', 'kartenpflicht', 'nichtAmZug', 'nichtAufHand'])
  })
})

/** Abwandlungen der aufgezählten Aktionen für Spieler 1, damit die Engine ablehnt. */
function abwandlungen(zustand: Spielzustand): SpielAktion[] {
  const liste: SpielAktion[] = [{ typ: 'ZugBeenden', spielerId: 'spieler-1' }, { typ: 'Reagieren', spielerId: 'spieler-1', farbenschutzId: 'farbenschutz-99' }]
  for (const aktion of ermittleAktionen(zustand)) {
    liste.push({ ...aktion, spielerId: 'spieler-1' })
    if ('karteId' in aktion) liste.push({ ...aktion, spielerId: 'spieler-1', karteId: 'rot-99' })
    if (aktion.typ === 'UeberhandAbwerfen') liste.push({ ...aktion, spielerId: 'spieler-1', karteIds: aktion.karteIds.slice(1) })
  }
  return liste
}

describe('O6 (Weg A): Am Tisch nennt kein Grund dich „Spieler 1“', () => {
  it('O6: in Zufallszuständen und gespielten Partien, für „Zug beenden“ und jede Ablehnung deiner Aktionen', () => {
    const zustaende: Spielzustand[] = []
    for (let saat = 1; saat <= 80; saat += 1) zustaende.push(zufallszustand(erzeugeZufall(saat)))
    for (let saat = 1; saat <= 4; saat += 1) {
      const zufall = erzeugeZufall(700 + saat)
      let zustand = baukasten({ spielerzahl: 2 + (saat % 3), erweiterung: false, zufall }).haendeAuffuellen().zustand()
      for (let schritt = 0; schritt < 50 && zustand.partiephase !== 'Beendet'; schritt += 1) {
        zustaende.push(zustand)
        const aktionen = ermittleAktionen(zustand)
        zustand = anwendeAktion(zustand, aktionen[Math.floor(zufall() * aktionen.length)]).zustand
      }
    }
    let duGeformt = 0
    let woertlich = 0
    for (const zustand of zustaende) {
      const personen = zustand.spieler.map((spieler, index) => ({ name: spieler.name, ich: index === 0 }))
      const gesperrt = tischAnsicht(zustand).zugBeendenGesperrt
      if (gesperrt !== null) expect(gesperrt, 'tischAnsicht: Grund neben „Zug beenden“').not.toContain('Spieler 1')
      if (ermittleEntscheider(zustand) !== 0) continue
      for (const aktion of abwandlungen(zustand)) {
        const ergebnis = pruefeAktion(zustand, aktion)
        if (ergebnis.erlaubt) continue
        const text = grundFuerDich(ergebnis, (index) => personen[index])
        expect(text, `grundFuerDich: „${ergebnis.grund}“`).not.toContain('Spieler 1')
        if (ergebnis.nennt === undefined) {
          expect(text, 'grundFuerDich: ein Grund ohne Spieler bleibt wörtlich').toBe(ergebnis.grund)
          woertlich += 1
        } else duGeformt += 1
      }
    }
    expect(duGeformt, 'Gründe in Du-Form in der Stichprobe').toBeGreaterThan(100)
    expect(woertlich, 'wörtliche Gründe in der Stichprobe').toBeGreaterThan(100)
  })
})
