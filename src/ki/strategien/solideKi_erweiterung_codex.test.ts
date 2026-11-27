// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider, erzeugeZufall } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { legeAufgabenAus } from '../../engine/testing/aufgaben'
import { baukasten } from '../../engine/testing/szenario'
import { kiWahl } from '../schritt'
import { sichtFuer } from '../sicht'
import { erstelleSolideKi } from './solideKi'
import { erstelleSuche, istDurchlassen } from './suche'
import { schaetzeZiehen } from './ziehen'

/*
K4, Befunde des Codex-Reviews (27.11.2026), je mit der Stellung aus dem Befund:
1. Nach einer Wahl, die verdeckt eine Stapelkarte zieht, darf auch die Vertiefung
   nicht mit der einen erratenen Karte weiterplanen (K2.7: kein Zufall der KI).
2. Aufgaben, die ein Gegner in der Simulation erst vom erratenen Aufgabenstapel
   aufdeckt und einlöst, zählen auch bei ihm nicht (B2).
4. Mit der Comeback-Karte plant die KI auch „Zwei Karten abwerfen, drei ziehen“ ein
   (A8.1, D49).
5. Beim Korb „ziehen“ zählt eine gezogene Regenbogenschlange, die eine Gruppe
   vollendet (D43).
Aus der zweiten Prüfung desselben Tages:
4. Zieht die KI nach dem Korb „aktionen“, zählt eine Aufgabe, die der Korb schon
   eingelöst hat, in der Schätzung nicht ein zweites Mal (A9).
5. Die dritte gezogene Karte nach D71 ist die Farbkarte des Zuges, keine
   Regenbogenschlange.
*/

function spiele(zustand: Spielzustand, passt: (aktion: SpielAktion) => boolean): Spielzustand {
  const aktion = ermittleAktionen(zustand).find(passt)
  if (aktion === undefined) throw new Error(`Testaufbau: keine passende Aktion unter ${JSON.stringify(ermittleAktionen(zustand))}`)
  return anwendeAktion(zustand, aktion).zustand
}

/** Die Wahlen der soliden KI in `zustand` mit 20 verschiedenen Saaten, ohne Wiederholungen. */
function wahlen(zustand: Spielzustand): string[] {
  return [...new Set(Array.from({ length: 20 }, (_, saat) => JSON.stringify(kiWahl(zustand, erstelleSolideKi(erzeugeZufall(saat + 1))))))]
}

describe('K4, Codex-Befund 1, K2.7: nach einer Wahl mit verdeckter Stapelkarte plant die Vertiefung nicht mit der erratenen Karte', () => {
  it('K4.2, D54: nach gelungener Risiko-Aktion 4 wählt sie zwischen Ablage und Stapel mit jeder Saat gleich', () => {
    const start = baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(47) })
      .schlange(1, ['Grün', 'Grün'])
      .schlange(1, ['Blau', 'Rot'])
      .schlange(0, ['Braun', 'Braun', 'Braun'])
      .hand(1, ['Gelb', 'Schlangenblockade', 'Blau', 'Farbenschutz', 'Schlangengrube'])
      .ablage(1, ['Rot'])
      .haendeAuffuellen()
      .stapelOben(['Rot'])
      .amZug(1)
      .zugbeginn()
      .zustand()
    const wahl = spiele(start, (aktion) => aktion.typ === 'RisikoKarteSpielen' && aktion.risikoAktion === 4)
    expect(wahl.entscheidung?.art, 'Testaufbau').toBe('Risiko: Karte vom eigenen Ablagestapel oder oberste Stapelkarte')
    expect(wahlen(wahl), `K2.7: Entscheider ${ermittleEntscheider(wahl)}`).toHaveLength(1)
  })
})

describe('K4, Codex-Befund 2, B2: geraten aufgedeckte Aufgaben eines Gegners zählen nicht', () => {
  it('A9, D5: lässt sie einen Farbendieb durch, der dem Gegner Farbkombination bringt, ist der Wert mit jeder Saat gleich, auch wenn die Simulation danach eine weitere Aufgabe aufdeckt', () => {
    const start = baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(48) })
      .schlange(0, ['Violett', 'Violett', 'Violett', 'Violett'])
      .schlange(1, ['Violett', 'Grün', 'Grün'])
      .hand(0, ['Farbendieb'])
      .hand(1, ['Farbenschutz', 'Blau', 'Rot', 'Gelb', 'Braun'])
      .aendere((stand) => legeAufgabenAus(stand, { offen: ['Farbkombination', 'Symmetriemeister', 'Farbharmonie'], geheim: [[0, 'Schlangentanz'], [1, 'Fusionsexperte']] }))
      .haendeAuffuellen()
      .amZug(0)
      .zustand()
    const violett = start.spieler[1].schlangen[0].karten[0].id
    // Spieler 1 stiehlt das Violett von KI-Gegner 1 ans Ende seiner Violett ×4 (A7.1); KI-Gegner 1 ist gefragt.
    const zustand = spiele(start, (aktion) => aktion.typ === 'FarbendiebSpielen' && aktion.quelle.karteId === violett && aktion.ziel.art === 'schlange' && aktion.ziel.schlangenId === 'schlange-1' && aktion.ziel.position === 4)
    expect(zustand.schwebend, 'Testaufbau: der Farbendieb ist angesagt').not.toBeNull()
    const sicht = sichtFuer(zustand, 1)
    const durchlassen = ermittleAktionen(zustand).find(istDurchlassen)!
    const werte = new Set(
      Array.from({ length: 20 }, (_, saat) => {
        const suche = erstelleSuche(sicht, erzeugeZufall(saat + 1))
        return suche.folge(suche.wurzel, sicht, durchlassen).wert.toFixed(9)
      }),
    )
    expect([...werte], 'B2: der Wert nach dem Durchlassen hängt nicht von der erratenen Aufgabe ab').toHaveLength(1)
  })
})

describe('K4, Codex-Befund 4, A8.1, D49: die Comeback-Karte für „Zwei Karten abwerfen, drei ziehen“', () => {
  it('K4.2: mit zwei Schlangenhäutungen und drei Farbenfusionen ohne Ziel setzt sie die Comeback-Karte ein und zieht', () => {
    const start = baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(49) })
      .schlange(1, ['Grün', 'Grün'])
      .schlange(0, ['Rot', 'Schlangenblockade', 'Gelb', 'Schlangenblockade', 'Blau', 'Schlangenblockade', 'Rot'])
      .hand(1, ['Schlangenhäutung', 'Schlangenhäutung', 'Farbenfusion', 'Farbenfusion', 'Farbenfusion'])
      .haendeAuffuellen()
      .aendere((stand) => {
        legeAufgabenAus(stand, { offen: ['Symmetriemeister', 'Lila Riese', 'Gelber Schatz'], geheim: [[0, 'Farbkombination'], [1, 'Farbharmonie']] })
        stand.ausDemSpiel.push(...stand.spieler[1].risikoKarten.splice(0))
      })
      .amZug(1)
      .zugbeginn()
      .zustand()
    expect(start.zug.comebackBedingung, 'Testaufbau: 5 Karten Rückstand').toBe(true)
    const erste = kiWahl(start, erstelleSolideKi(erzeugeZufall(1)))
    expect(erste?.typ, `K4.2: gewählt ${JSON.stringify(erste)}`).toBe('ComebackEinsetzen')
    const nachher = anwendeAktion(start, erste!).zustand
    expect(kiWahl(nachher, erstelleSolideKi(erzeugeZufall(1)))?.typ, 'K4.2: danach zieht sie').toBe('ZweiAbwerfenDreiZiehen')
  })
})

describe('K4, Codex-Befund 5, D43: eine gezogene Regenbogenschlange zählt beim Korb „ziehen“', () => {
  it('K4.2: ungesehen sind fast nur Regenbogenschlangen und Verdoppler; mit Grün, Grün und gespielter Farbkarte zieht sie mit dem Korb, statt den Zug zu beenden', () => {
    const start = baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(50) })
      .schlange(1, ['Grün', 'Grün'])
      .hand(1, ['Schlangenkorb des Glücks', 'Farbenschutz', 'Farbenschutz', 'Farbenschutz', 'Farbenschutz'])
      .hand(0, ['Regenbogenschlange', 'Regenbogenschlange', 'Regenbogenschlange', 'Verdoppler', 'Verdoppler'])
      .stapelOben(['Regenbogenschlange', 'Verdoppler', 'Verdoppler', 'Farbenfusion'])
      .stapelBehalten(4)
      .amZug(1)
      .gespielt(1, 0)
      .zustand()
    for (const saat of [1, 2, 3]) {
      const wahl = kiWahl(start, erstelleSolideKi(erzeugeZufall(saat)))
      expect(wahl, `D43: Saat ${saat}`).toMatchObject({ typ: 'SchlangenkorbSpielen', bonus: { art: 'ziehen' } })
    }
  })
})

describe('K4, Codex-Befund 4 (zweite Prüfung), A9: nach dem Korb „aktionen“ zählt eine eingelöste Aufgabe beim Ziehen nicht doppelt', () => {
  it('A8.1, D49: der Korb als fünfte Art löst Schlangenrepertoire ein; „Zwei Karten abwerfen, drei ziehen“ danach schätzt sie wie aus der Stellung nach dem Korb', () => {
    const start = baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(51) })
      .schlange(1, ['Grün', 'Grün'])
      .schlange(0, ['Braun', 'Braun'])
      .hand(1, ['Schlangenkorb des Glücks', 'Rot', 'Gelb', 'Farbenschutz', 'Farbenschutz'])
      .haendeAuffuellen()
      .aendere((stand) => {
        legeAufgabenAus(stand, { offen: ['Schlangenrepertoire', 'Symmetriemeister', 'Lila Riese'], geheim: [[0, 'Gelber Schatz'], [1, 'Schlangentanz']], stapelOben: ['Schlangenbeschwörer'] })
        stand.spieler[1].ausgespielteSonderkarten.push('Farbendieb', 'Schlangenblockade', 'Farbenfusion', 'Verdoppler')
      })
      .amZug(1)
      .zustand()
    const korb = ermittleAktionen(start).find((aktion) => aktion.typ === 'SchlangenkorbSpielen' && aktion.bonus.art === 'aktionen')!
    const sicht = sichtFuer(start, 1)
    const suche = erstelleSuche(sicht, erzeugeZufall(1))
    const folge = suche.folge(suche.wurzel, sicht, korb)
    expect(folge.stellung.sicht.spieler[1].erfuellteAufgaben.map((aufgabe) => aufgabe.name), 'Testaufbau').toEqual(['Schlangenrepertoire'])
    const geplant = schaetzeZiehen(folge.stellung.sicht, folge.stellung.aktionen(), suche.schaetzrechnungAb(folge.stellung))
    const nachher = anwendeAktion(start, korb).zustand
    const sichtNachher = sichtFuer(nachher, 1)
    const direkt = schaetzeZiehen(sichtNachher, ermittleAktionen(nachher), erstelleSuche(sichtNachher, erzeugeZufall(1)).schaetzrechnung)
    expect(geplant?.aktion, 'A8.1: dieselbe Aktion').toEqual(direkt?.aktion)
    expect(geplant?.wert, `A9: geschätzt nach dem Korb ${geplant?.wert}, aus der Stellung danach ${direkt?.wert}`).toBeCloseTo(direkt!.wert, 9)
  })
})

describe('K4, Codex-Befund 5 (zweite Prüfung), D71: die dritte gezogene Karte ist die Farbkarte des Zuges', () => {
  it('D43, D71: zieht der Korb nur Regenbogenschlangen, ist die Schätzung gleich, ob die Farbkarte des Zuges noch frei ist oder nicht', () => {
    const werte = [0, 1].map((farbkarten) => {
      const zustand = baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(52) })
        .schlange(1, ['Grün', 'Grün', 'Schlangenblockade', 'Rot', 'Rot'])
        .schlange(1, ['Gelb', 'Gelb'])
        .hand(1, ['Schlangenkorb des Glücks', 'Farbenschutz', 'Farbenschutz', 'Farbenschutz', 'Farbenschutz'])
        .stapelOben(['Regenbogenschlange', 'Regenbogenschlange', 'Regenbogenschlange'])
        .stapelBehalten(3)
        .amZug(1)
        .gespielt(farbkarten, 0)
        .zustand()
      const sicht = sichtFuer(zustand, 1)
      return schaetzeZiehen(sicht, ermittleAktionen(zustand), erstelleSuche(sicht, erzeugeZufall(1)).schaetzrechnung)?.wert
    })
    expect(werte[0], `D71: frei ${werte[0]}, gespielt ${werte[1]}`).toBeCloseTo(werte[1]!, 9)
  })
})
