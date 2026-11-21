import { describe, expect, it } from 'vitest'
import { cleanup, screen } from '@testing-library/react'
import type { Spielzustand } from '../../engine'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { aktionMit, angeboteneZiele, ausfuehren, gespieltWurde, handkarte, spieleAm, tippe, tippeZiel, zugleiste } from './__tests__/bedienen'

/*
O5, Kriterium 3: Jede Sonderkarte ist ohne Liste spielbar, nur mit Antippen
von Karte und Zielen am Tisch. Jeder Test geht den Weg einer Karte bis zum
„Ausführen“ und vergleicht den gespeicherten Stand mit dem, den die Engine aus
genau dieser aufgezählten Aktion macht.
*/

const id = (zustand: Spielzustand, spieler: number, schlange: number, stelle: number) => zustand.spieler[spieler].schlangen[schlange].karten[stelle].id

describe('O5 K3: Jede Sonderkarte ist ohne Liste spielbar', () => {
  it('O5 K3/A7.1, D17: Farbendieb: erst die Karte beim Gegner, dann der Platz in deiner Schlange', () => {
    const start = erzeugeSzenario('farbendieb')
    spieleAm(start)
    tippe(handkarte('Sonderkarte Farbendieb'))
    tippeZiel('KI-Gegner 1, Schlange 1, Karte 2: Farbkarte Gelb, 1 Punkt')
    tippeZiel('Deine Schlange 1: vor Karte 1')
    ausfuehren()
    const gelb = id(start, 1, 0, 1)
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'FarbendiebSpielen' && a.quelle.karteId === gelb && a.ziel.art === 'schlange' && a.ziel.position === 0))).toBe(true)
  })

  it('O5 K3/A7.4 a): Schlangenfrass frisst eine Karte deiner eigenen Schlange', () => {
    const start = erzeugeSzenario('frass-eigen')
    spieleAm(start)
    tippe(handkarte('Sonderkarte Schlangenfrass'))
    tippe(zugleiste().getByRole('button', { name: /^a\)/ }))
    tippeZiel('Deine Schlange 1, Karte 4: Farbkarte Rot, 1 Punkt')
    ausfuehren()
    const rot = id(start, 0, 0, 3)
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'SchlangenfrassSpielen' && a.option === 'eigeneKarte' && a.ziele[0].karteId === rot))).toBe(true)
  })

  it('O5 K3/A7.4 b): Schlangenfrass entfernt die Schlangenblockade aus deiner Schlange', () => {
    const start = erzeugeSzenario('frass-eigen')
    spieleAm(start)
    tippe(handkarte('Sonderkarte Schlangenfrass'))
    expect(zugleiste().queryByRole('button', { name: /^c\)/ }), 'c) gibt es ohne gegnerische Schlange nicht').toBeNull()
    tippe(zugleiste().getByRole('button', { name: /^b\)/ }))
    tippeZiel('Deine Schlange 1, Karte 3: Sonderkarte Schlangenblockade')
    ausfuehren()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'SchlangenfrassSpielen' && a.option === 'eigeneBlockade'))).toBe(true)
  })

  it('O5 K3/A7.4 c): Schlangenfrass frisst zwei Karten aus den Schlangen zweier Mitspieler, in beliebiger Reihenfolge', () => {
    const start = erzeugeSzenario('frass-zwei-spieler')
    spieleAm(start)
    tippe(handkarte('Sonderkarte Schlangenfrass'))
    tippe(zugleiste().getByRole('button', { name: /^c\)/ }))
    tippeZiel('KI-Gegner 2, Schlange 1, Karte 3: Farbkarte Gelb, 1 Punkt')
    expect(zugleiste().queryByRole('button', { name: 'Ausführen' }), 'eine Karte allein reicht nicht, zwei sind möglich').toBeNull()
    tippeZiel('KI-Gegner 1, Schlange 1, Karte 1: Farbkarte Blau, 1 Punkt')
    ausfuehren()
    const blau = id(start, 1, 0, 0)
    const gelb = id(start, 2, 0, 2)
    expect(
      gespieltWurde(start, aktionMit(start, (a) => a.typ === 'SchlangenfrassSpielen' && a.ziele.map((ziel) => ziel.karteId).sort().join() === [blau, gelb].sort().join())),
    ).toBe(true)
  })

  it('O5 K3/A7.5: Schlangenblockade: erst die Schlange, dann die Lücke', () => {
    const start = erzeugeSzenario('blockade-abwehr')
    spieleAm(start)
    tippe(handkarte('Sonderkarte Schlangenblockade'))
    expect(screen.queryByRole('button', { name: /zwischen Karte/ }), 'Lücken erst nach der Schlange').toBeNull()
    tippeZiel('KI-Gegner 1, Schlange 1 wählen')
    tippeZiel('KI-Gegner 1, Schlange 1: zwischen Karte 1 und 2')
    ausfuehren()
    const blockade = start.spieler[0].hand[0].id
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'BlockadeLegen' && a.karteId === blockade && a.schlangenId === 'schlange-2' && a.position === 1))).toBe(true)
  })

  it('O5 K3/A7.3: Regenbogenschlange: erst die Schlange, dann die Lücke, auch in der eigenen', () => {
    const start = erzeugeSzenario('regenbogen')
    spieleAm(start)
    tippe(handkarte('Sonderkarte Regenbogenschlange'))
    tippeZiel('Deine Schlange 1 wählen')
    tippeZiel('Deine Schlange 1: zwischen Karte 2 und 3')
    ausfuehren()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'RegenbogenschlangeLegen' && a.schlangenId === 'schlange-1' && a.position === 2))).toBe(true)
  })

  it('O5 K3/A7.7: Farbenfusion: das Kartenpaar, in beliebiger Reihenfolge angetippt', () => {
    const start = erzeugeSzenario('fusion-eigen')
    spieleAm(start)
    tippe(handkarte('Sonderkarte Farbenfusion'))
    tippeZiel('Deine Schlange 1, Karte 4: Farbkarte Gelb, 1 Punkt')
    expect(angeboteneZiele(), 'nach der ersten Gelb nur noch ihr Partner').toHaveLength(1)
    tippeZiel('Deine Schlange 1, Karte 3: Farbkarte Gelb, 1 Punkt')
    ausfuehren()
    const fusion = start.spieler[0].hand[0].id
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'FusionLegen' && a.karteId === fusion && a.kartenIds.includes(id(start, 0, 0, 2))))).toBe(true)
  })

  it('O5 K3/A7.6: Schlangengrube: den Gegner wählen', () => {
    const start = erzeugeSzenario('schlangengrube')
    spieleAm(start)
    tippe(handkarte('Sonderkarte Schlangengrube'))
    tippeZiel('KI-Gegner 2 wählen')
    ausfuehren()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'SchlangengrubeSpielen' && a.zielSpielerId === 'spieler-3'))).toBe(true)
  })

  it('O5 K3/A7.8: Verdoppler: die Karte allein, dann bestätigen', () => {
    const start = erzeugeSzenario('verdoppler')
    spieleAm(start)
    tippe(handkarte('Sonderkarte Verdoppler'))
    expect(angeboteneZiele(), 'der Verdoppler hat kein Ziel am Tisch').toEqual([])
    ausfuehren()
    const verdoppler = start.spieler[0].hand[0].id
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'VerdopplerSpielen' && a.karteId === verdoppler))).toBe(true)
  })

  it('O5 K3/D13: ohne mögliches Ziel wirkungslos auf den eigenen Ablagestapel', () => {
    const start = erzeugeSzenario('nur-sonderkarten')
    spieleAm(start)
    tippe(handkarte('Sonderkarte Farbendieb'))
    tippeZiel('Ohne Wirkung auf deine Ablage')
    ausfuehren()
    const dieb = start.spieler[0].hand[2].id
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'SonderkarteWirkungslosAblegen' && a.karteId === dieb))).toBe(true)
  })

  it('O5/O7: eine Schlangenhäutung mit Ziel stört die Hand nicht; ohne Ziel liegt sie wirkungslos ab', () => {
    spieleAm(erzeugeSzenario('haeutung'))
    expect(handkarte('Sonderkarte Schlangenhäutung (jetzt nicht spielbar)')).toBeDisabled()
    expect(handkarte('Farbkarte Rot, 1 Punkt')).toBeEnabled()
    cleanup()

    const start = erzeugeSzenario('haeutung-nicht-moeglich')
    spieleAm(start)
    tippe(handkarte('Sonderkarte Schlangenhäutung'))
    tippeZiel('Ohne Wirkung auf deine Ablage')
    ausfuehren()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'SonderkarteWirkungslosAblegen' && a.karteId === start.spieler[0].hand[0].id))).toBe(true)
  })
})
