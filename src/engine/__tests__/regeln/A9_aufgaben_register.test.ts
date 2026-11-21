import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { AUFGABEN_TABELLE } from '../../../test/specText'
import { istAufgabenPlatzhalter, platzhalterAufgabe } from '../../aufgaben/definition'
import { AUFGABENREGISTER, definitionFuerAufgabe, erstelleAufgabenStapel } from '../../aufgabenKarten'
import { anwendeAktion, ermittleAktionen, erstellePartie } from '../../index'
import type { Spielzustand } from '../../index'
import { legeAufgabenAus } from '../../testing/aufgaben'
import { baukasten } from '../../testing/szenario'
import { entferneTestbedingungen, setzeTestbedingungen } from '../../testing/testaufgaben'
import { erzeugeZufall } from '../../testing/zufall'
import { zufallszustand } from '../../testing/zufallszustand'
import { aufgabenEreignisse, aufgabenTisch, immer, legeAn, namen } from '../aufgaben_hilfen'

/*
X1, Kriterium 1 und der Aufbau für X2: Die 15 Aufgaben aus A9 stehen je mit
einer eigenen Datei unter `aufgaben/` im Register (`aufgabenKarten.ts`). Solange
X2 eine Aufgabe nicht umgesetzt hat, ist sie ein Platzhalter, der nie erfüllt
ist. X2 füllt je Aufgabe nur ihre Datei; welche Aufgabe noch Platzhalter ist,
sagt das Register selbst, ohne Liste von Hand. D34: ohne Erweiterung keine
Aufgaben und keine Prüfung.
*/

/** A9, Tabelle „Verfügbare Aufgabenkarten“, mit der Datei unter `aufgaben/`. */
const DATEIEN = [
  'farbenpracht',
  'farbharmonie',
  'farbkombination',
  'farbvielfalt',
  'vielfaltskoenig',
  'farbwechsler',
  'fusionsexperte',
  'schlangenbeschwoerer',
  'schlangenmeister',
  'schlangenrepertoire',
  'schlangenbaendiger',
  'schlangentanz',
  'symmetriemeister',
  'gelberSchatz',
  'lilaRiese',
]
const EINTRAEGE = AUFGABEN_TABELLE.map(([nummer, name, punkte, bedingung], index) => ({ nummer: Number(nummer), name, punkte: Number(punkte), bedingung, datei: DATEIEN[index] }))

describe('A1/A9: die 15 Aufgaben im Register', () => {
  it('A1/A9: es sind 15 Aufgaben, mit Nummer, Name, Punkten und Kartentext aus A9; die Id trägt die Nummer', () => {
    expect(EINTRAEGE).toHaveLength(15)
    expect(erstelleAufgabenStapel().map((aufgabe) => [aufgabe.id, aufgabe.name, aufgabe.punkte, aufgabe.bedingung])).toEqual(
      EINTRAEGE.map(({ nummer, name, punkte, bedingung }) => [`aufgabe-${String(nummer).padStart(2, '0')}`, name, punkte, bedingung]),
    )
  })

  it('A9: das Register hat je Aufgabe genau einen Eintrag, in der Reihenfolge von A9, und jeder trägt seinen Namen', () => {
    expect([...AUFGABENREGISTER.keys()]).toEqual(EINTRAEGE.map(({ name }) => name))
    for (const [name, definition] of AUFGABENREGISTER) expect(definition.name, `AUFGABENREGISTER: ${name}`).toBe(name)
    expect(new Set(AUFGABENREGISTER.values()).size, 'A9: jede Aufgabe hat ihre eigene Definition').toBe(15)
  })

  it.each(EINTRAEGE)('A9 Nr. $nummer: $name steht in aufgaben/$datei.ts und wird über die Karte gefunden', ({ name, datei }) => {
    expect(existsSync(resolve(__dirname, `../../aufgaben/${datei}.ts`)), `A9: aufgaben/${datei}.ts fehlt`).toBe(true)
    const karte = erstelleAufgabenStapel().find((aufgabe) => aufgabe.name === name)!
    expect(definitionFuerAufgabe(karte)).toBe(AUFGABENREGISTER.get(name))
  })

  it.each(EINTRAEGE)('X1: $name ist genau dann als Platzhalter markiert, wenn aufgaben/$datei.ts platzhalterAufgabe() aufruft', ({ name, datei }) => {
    const quelle = readFileSync(resolve(__dirname, `../../aufgaben/${datei}.ts`), 'utf8')
    const ruftPlatzhalter = /\bplatzhalterAufgabe\(/.test(quelle)
    expect(istAufgabenPlatzhalter(AUFGABENREGISTER.get(name)!), `istAufgabenPlatzhalter(${name}): erwartet ${ruftPlatzhalter}`).toBe(ruftPlatzhalter)
  })

  it('X1: platzhalterAufgabe() markiert ihren Eintrag; eine eigene Definition ist nicht markiert', () => {
    expect(istAufgabenPlatzhalter(platzhalterAufgabe('Lila Riese'))).toBe(true)
    expect(istAufgabenPlatzhalter({ name: 'Lila Riese', istErfuellt: () => false })).toBe(false)
  })

  it('A9: eine Karte, die es nicht gibt, hat keine Definition; der Grund ist deutsch', () => {
    expect(() => definitionFuerAufgabe({ typ: 'Aufgabenkarte', id: 'aufgabe-16', name: 'Schlangenkönig', punkte: 3, bedingung: '–' })).toThrow(/Schlangenkönig.*A9/)
  })
})

describe('A9/X1: die Platzhalter sind nie erfüllt', () => {
  // Welche Aufgabe noch Platzhalter ist, sagt das Register; setzt X2 eine um, fällt sie hier heraus.
  const istPlatzhalterKarte = (aufgabe: { name: string }) => istAufgabenPlatzhalter(AUFGABENREGISTER.get(aufgabe.name)!)

  it('A9: jeder Platzhalter ist in 100 Zufallszuständen für keinen Spieler erfüllt', () => {
    const platzhalter = [...AUFGABENREGISTER.values()].filter(istAufgabenPlatzhalter)
    for (let saat = 1; saat <= 100; saat += 1) {
      const zustand = zufallszustand(erzeugeZufall(saat))
      for (const definition of platzhalter) {
        for (const index of zustand.spieler.keys()) expect(definition.istErfuellt(zustand, index), `${definition.name}, Saat ${saat}, Spieler ${index}`).toBe(false)
      }
    }
  })

  it('A9: in 30 Zufallspartien mit Erweiterung wird kein Platzhalter eingelöst, weder offen noch geheim', () => {
    for (let saat = 1; saat <= 30; saat += 1) {
      const wahl = erzeugeZufall(saat + 500)
      let zustand = erstellePartie({ spielerzahl: 2 + (saat % 3), erweiterung: true, zufall: erzeugeZufall(saat) })
      const geheime = zustand.spieler.map((spieler) => spieler.geheimeAufgabe!)
      while (zustand.partiephase !== 'Beendet') {
        const aktionen = ermittleAktionen(zustand)
        zustand = anwendeAktion(zustand, aktionen[Math.floor(wahl() * aktionen.length)]).zustand
      }
      const eingeloest = zustand.spieler.flatMap((spieler) => spieler.erfuellteAufgaben).filter(istPlatzhalterKarte)
      expect(namen(eingeloest), `Saat ${saat}: eingelöste Platzhalter`).toEqual([])
      const geheimErfuellt = zustand.spieler.filter((spieler, index) => spieler.geheimeAufgabeErfuellt && istPlatzhalterKarte(geheime[index]))
      expect(geheimErfuellt.map((spieler) => spieler.id), `Saat ${saat}: geheime Platzhalter erfüllt`).toEqual([])
    }
  }, 120_000)
})

describe('D34: ein Schalter für die ganze Erweiterung', () => {
  it('D34: ohne Erweiterung wird keine Aufgabe geprüft, auch wenn jede Bedingung erfüllt wäre', () => {
    const bedingung = vi.fn(immer())
    setzeTestbedingungen(Object.fromEntries([...AUFGABENREGISTER.keys()].map((name) => [name, bedingung])))
    let zustand: Spielzustand = baukasten({ spielerzahl: 2, erweiterung: false }).schlange(0, ['Blau', 'Blau']).hand(0, ['Blau']).haendeAuffuellen().zustand()
    for (let schritt = 0; schritt < 20; schritt += 1) {
      const ergebnis = anwendeAktion(zustand, ermittleAktionen(zustand)[0])
      expect(aufgabenEreignisse(ergebnis.ereignisse)).toEqual([])
      zustand = ergebnis.zustand
    }
    expect(bedingung).not.toHaveBeenCalled()
    expect(zustand.offeneAufgaben).toEqual([])
    expect(zustand.spieler.every((spieler) => spieler.erfuellteAufgaben.length === 0 && !spieler.geheimeAufgabeErfuellt)).toBe(true)
  })

  it('D34: mit Erweiterung prüft dieselbe Engine die Aufgaben', () => {
    setzeTestbedingungen({ Farbkombination: immer() })
    const { zustand } = legeAn(aufgabenTisch().zustand(), 'Blau')
    expect(namen(zustand.spieler[0].erfuellteAufgaben)).toEqual(['Farbkombination'])
  })
})

describe('A9/X1: Testbedingungen für Tests und den Entwicklertisch', () => {
  it('X1: setzeTestbedingungen ersetzt nur die genannten Aufgaben, entferneTestbedingungen stellt die Platzhalter wieder her', () => {
    const vorher = AUFGABENREGISTER.get('Farbkombination')!.istErfuellt
    const zustand = aufgabenTisch().zustand()
    setzeTestbedingungen({ Farbkombination: immer() })
    expect(AUFGABENREGISTER.get('Farbkombination')!.istErfuellt(zustand, 0)).toBe(true)
    expect(AUFGABENREGISTER.get('Lila Riese')!.istErfuellt(zustand, 0)).toBe(false)
    setzeTestbedingungen({ 'Lila Riese': immer() })
    expect(AUFGABENREGISTER.get('Farbkombination')!.istErfuellt, 'X1: ein neuer Satz Testbedingungen ersetzt den alten ganz').toBe(vorher)
    entferneTestbedingungen()
    expect(AUFGABENREGISTER.get('Lila Riese')!.istErfuellt(zustand, 0)).toBe(false)
    expect(istAufgabenPlatzhalter(AUFGABENREGISTER.get('Lila Riese')!)).toBe(true)
  })

  it('X1: eine Testbedingung für eine Aufgabe, die es nicht gibt, wird abgelehnt', () => {
    expect(() => setzeTestbedingungen({ Schlangenkönig: immer() })).toThrow(/Schlangenkönig/)
  })

  it('X1: legeAufgabenAus legt offene, oberste und geheime Aufgaben wie verlangt; jede bleibt genau einmal im Spiel', () => {
    const zustand = baukasten({ spielerzahl: 3, erweiterung: true }).zustand()
    legeAufgabenAus(zustand, { offen: ['Lila Riese', 'Farbvielfalt'], stapelOben: ['Schlangentanz'], geheim: [[2, 'Farbenpracht']] })
    expect(namen(zustand.offeneAufgaben)).toEqual(['Lila Riese', 'Farbvielfalt'])
    expect(zustand.aufgabenStapel[0].name).toBe('Schlangentanz')
    expect(zustand.spieler[2].geheimeAufgabe?.name).toBe('Farbenpracht')
    const alle = [...zustand.offeneAufgaben, ...zustand.aufgabenStapel, ...zustand.spieler.map((spieler) => spieler.geheimeAufgabe!)]
    expect(namen(alle).sort()).toEqual(EINTRAEGE.map(({ name }) => name).sort())
    expect(() => legeAufgabenAus(zustand, { offen: ['Lila Riese', 'Lila Riese'] })).toThrow(/Lila Riese/)
  })
})
