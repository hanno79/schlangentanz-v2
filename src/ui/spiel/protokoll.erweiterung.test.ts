import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen } from '../../engine'
import type { SpielAktion, Spielkarte, Spielzustand } from '../../engine'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { protokollSchritt } from './protokoll'
import { tischAnsicht } from './tischAnsicht'

/*
O10, Kriterium 3: Jede Entscheidung der Erweiterung ist nachvollziehbar, auch
die eines KI-Gegners. Das Protokoll nennt, welche Risiko-Aktion gespielt ist,
welche Karte aufgedeckt wurde und wie die Prüfung ausging, wer was wählt und
wohin offene Karten gehen. Offen sind die aufgedeckte Karte und die für
Aktion 2 angesagte Karte (D52, D77); sie heissen nie „verdeckte Karte“.
Karten, die verdeckt vom Nachziehstapel kommen, stehen nur als Zahl da (B2).
*/

function schritt(vorher: Spielzustand, aktion: SpielAktion): { saetze: string[]; nachher: Spielzustand } {
  const { zustand, ereignisse } = anwendeAktion(vorher, aktion)
  return { saetze: protokollSchritt(vorher, aktion, ereignisse, tischAnsicht(vorher)), nachher: zustand }
}

function finde(zustand: Spielzustand, passt: (aktion: SpielAktion) => boolean): SpielAktion {
  const aktion = ermittleAktionen(zustand).find(passt)
  if (aktion === undefined) throw new Error('Testaufbau: Die Engine zählt die erwartete Aktion nicht auf.')
  return aktion
}

const farbkarte = (zustand: Spielzustand, spieler: number, farbe: string): Spielkarte =>
  zustand.spieler[spieler].hand.find((karte) => karte.typ === 'Farbkarte' && karte.farbe === farbe)!

const risiko = (nummer: number, benannt: string | null = null) => (a: SpielAktion) => a.typ === 'RisikoKarteSpielen' && a.risikoAktion === nummer && a.benannt === benannt
const entscheide = (wahl: string) => (a: SpielAktion) => a.typ === 'Entscheiden' && a.wahl === wahl

describe('O10 K3/A8.2: Risiko-Karten im Protokoll', () => {
  it('O10 K3/A8.2: Aktion 1 mit Erfolg: Aktion, aufgedeckte Karte mit Punkten, Ergebnis, wohin sie kommt, wie viele Karten gezogen werden', () => {
    const vorher = erzeugeSzenario('risiko-erfolg')
    expect(schritt(vorher, finde(vorher, risiko(1))).saetze).toEqual([
      'Du spielst eine Risiko-Belohnungs-Karte: Aktion 1 (Zusätzliche Karten ziehen).',
      'Aufgedeckt wird Blau (1 Punkt): Erfolg.',
      'Blau kommt auf deine Hand.',
      'Du ziehst 2 Karten.',
    ])
  })

  it('O10 K3/D52, D77: Aktion 2 mit Misserfolg: die angesagte Karte, die Wahl des Gegners und die Karte, die er nimmt, stehen mit Namen da', () => {
    const start = erzeugeSzenario('risiko-misserfolg')
    const blau = farbkarte(start, 0, 'Blau')
    const gespielt = schritt(start, finde(start, risiko(2, blau.id)))
    expect(gespielt.saetze).toEqual([
      'Du spielst eine Risiko-Belohnungs-Karte: Aktion 2 (Zusätzliche Farbkarte spielen), benannt: Blau.',
      'Aufgedeckt wird Schlangenfrass: Misserfolg.',
      'Schlangenfrass kommt auf deine Ablage.',
      'Du wählst jetzt den Gegner, der die Ersatzbelohnung bekommt.',
    ])
    const gewaehlt = schritt(gespielt.nachher, finde(gespielt.nachher, entscheide('spieler-2')))
    expect(gewaehlt.saetze).toEqual([
      'Du wählst KI-Gegner 1 als begünstigten Gegner.',
      'KI-Gegner 1 wählt jetzt zwischen der angesagten Karte und der obersten Karte vom Nachziehstapel.',
    ])
    expect(schritt(gewaehlt.nachher, finde(gewaehlt.nachher, entscheide('geplante'))).saetze).toEqual([
      'KI-Gegner 1 wählt die angesagte Karte.',
      'Blau kommt auf die Hand von KI-Gegner 1.',
    ])
    expect(schritt(gewaehlt.nachher, finde(gewaehlt.nachher, entscheide('stapel'))).saetze).toEqual([
      'KI-Gegner 1 wählt die oberste Karte vom Nachziehstapel.',
      'KI-Gegner 1 zieht 1 Karte.',
    ])
  })

  it('O10 K3/D52: Aktion 2 mit Erfolg: die zusätzliche Farbkarte steht mit Ziel da', () => {
    const start = erzeugeSzenario('risiko-erfolg')
    const rot = farbkarte(start, 0, 'Rot')
    const { nachher } = schritt(start, finde(start, risiko(2, rot.id)))
    expect(schritt(nachher, finde(nachher, entscheide(`${rot.id} schlange-1 ende`))).saetze).toEqual([
      'Du legst eine zusätzliche Farbkarte an.',
      'Rot kommt in deine Schlange 1.',
    ])
  })

  it('O10 K3/D51, D75: Aktion 3: Tausch und Verzicht; die getauschte Karte der Schlange heisst beim Namen', () => {
    const start = erzeugeSzenario('risiko-erfolg')
    const gelb = start.spieler[0].schlangen[0].karten[0]
    const { nachher } = schritt(start, finde(start, risiko(3, gelb.id)))
    const rot = farbkarte(nachher, 0, 'Rot')
    expect(schritt(nachher, finde(nachher, entscheide(rot.id))).saetze).toEqual([
      'Du tauschst die benannte Karte gegen eine Farbkarte der Hand.',
      'Rot kommt in deine Schlange 1.',
      'Gelb kommt auf deine Hand.',
    ])
    expect(schritt(nachher, finde(nachher, entscheide('kein Tausch'))).saetze).toEqual(['Du verzichtest auf den Tausch.'])
  })

  it('O10 K3/D53: Aktion 3, anderer Punktewert: davor oder dahinter, die aufgedeckte Karte heisst beim Namen', () => {
    const start = erzeugeSzenario('risiko-erfolg')
    const gruen = start.spieler[0].schlangen[0].karten[1]
    const gespielt = schritt(start, finde(start, risiko(3, gruen.id)))
    expect(gespielt.saetze).toContain('Aufgedeckt wird Blau (1 Punkt): Misserfolg.')
    expect(gespielt.saetze).toContain('Du wählst jetzt, ob die aufgedeckte Karte davor oder dahinter kommt.')
    expect(schritt(gespielt.nachher, finde(gespielt.nachher, entscheide('davor'))).saetze).toEqual([
      'Du legst die aufgedeckte Karte davor.',
      'Blau kommt in deine Schlange 1.',
    ])
  })

  it('O10 K3/D54: Aktion 4: die Karte von der eigenen Ablage heisst bei dir beim Namen', () => {
    const start = erzeugeSzenario('risiko-erfolg')
    const { nachher } = schritt(start, finde(start, risiko(4)))
    expect(schritt(nachher, finde(nachher, entscheide('ablagestapel-0'))).saetze).toEqual([
      'Du wählst eine Karte von deiner Ablage.',
      'Farbendieb kommt auf deine Hand.',
    ])
  })

  it('O10 K3/B2: kein Satz der Erweiterung nennt eine „verdeckte Karte“', () => {
    const start = erzeugeSzenario('risiko-misserfolg')
    const saetze = ermittleAktionen(start)
      .filter((a) => a.typ === 'RisikoKarteSpielen')
      .flatMap((aktion) => schritt(start, aktion).saetze)
    expect(saetze.join(' ')).not.toMatch(/verdeckt/i)
  })
})

describe('O10 K3/A7.10: Schlangenkorb im Protokoll', () => {
  it('O10 K3/D44: der Tausch nennt die Karte der Hand und die Karte der Schlange', () => {
    const start = erzeugeSzenario('korb-tauschen')
    const gelb = farbkarte(start, 0, 'Gelb')
    const rot = start.spieler[0].schlangen[0].karten[1]
    const aktion = finde(start, (a) => a.typ === 'SchlangenkorbSpielen' && a.bonus.art === 'tauschen' && a.bonus.tausch.length === 1 && a.bonus.tausch[0].karteId === rot.id && a.bonus.tausch[0].handkarteId === gelb.id)
    expect(schritt(start, aktion).saetze).toEqual(['Du spielst: Schlangenkorb des Glücks: Gelb statt Rot in deiner Schlange 1.'])
  })
})
