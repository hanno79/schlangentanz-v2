/**
 * Author: rahn
 * Datum: 20.06.2026
 * Version: 1.0
 * Beschreibung: M1cm macht die Zielwahl nach Kartenwahl als zusammenhängende Brettwege statt nur als Zielanzahl sichtbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { ermittleLegaleAktionen, erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, sonderkarte, schlange } from './engine/__tests__/testHelpers'
import { ermittleSpielbereiche, erstelleSpieltischMitEineSchlange } from './testUtils'
import { istVerdrahtet } from './test/smokeKetten'

const appCss = readFileSync('src/App.css', 'utf8')
const smokeScript = readFileSync('scripts/m1cm_zielwahl_faehrten_smoke.mjs', 'utf8')

const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1cm Waldtanz-Zielwahl-Fährten', () => {
  it('fasst nach einer Handkartenwahl Startkreis und Wachstumsenden als spielbare Brettwege zusammen', () => {
    window.history.pushState({}, '', '/game')
    const { zustand, anlegekarteId } = erstelleSpieltischMitEineSchlange('zielwahl-pfad-m1cm')
    const legaleAktionen = ermittleLegaleAktionen(zustand)
    const startZiele = legaleAktionen.filter((aktion) => aktion.typ === 'NeueSchlangeStarten' && aktion.handkartenId === anlegekarteId)
    const wachstumsZiele = legaleAktionen.filter((aktion) => aktion.typ === 'KarteAnlegen' && aktion.handkartenId === anlegekarteId)

    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: new RegExp(anlegekarteId) }))

    const zielspur = within(schlangenbereich).getByRole('note', { name: 'Waldtanz-Zielspur' })
    const brettwege = within(zielspur).getByRole('list', { name: 'Spielbare Brettwege' })
    const eintraege = within(brettwege).getAllByRole('listitem')

    expect(within(zielspur).getByText('Zielwahl am Brett')).toBeVisible()
    expect(within(zielspur).getByText('Wähle eine leuchtende Fährte direkt auf Startkreis, Schlange oder Zauberziel.')).toBeVisible()
    expect(eintraege.map((eintrag) => eintrag.textContent)).toContain(`Startkreis${startZiele.length}neue Schlange`)
    expect(eintraege.map((eintrag) => eintrag.textContent)).toContain(`Wachstumsenden${wachstumsZiele.length}Schlangenpfad`)
    expect(within(zielspur).queryByText('Aktionenliste')).toBeNull()
  })

  it('zählt Farbendieb-Einfügeplätze als ein sichtbares Gegnerziel pro Beutekarte', () => {
    window.history.pushState({}, '', '/game')
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const farbendieb = sonderkarte('farbendieb-m1cm', 'Farbendieb')
    zustand.spieler[0].hand = [farbendieb]
    zustand.spieler[0].schlangen = [schlange([farbkarte('gruen-m1cm-eigen', 'Grün', 2)], 'eigene-schlange-m1cm')]
    zustand.spieler[1].hand = []
    zustand.spieler[1].schlangen = [schlange([farbkarte('rot-m1cm-beute', 'Rot', 7)], 'gegner-schlange-m1cm')]

    render(<App initialZustand={zustand} />)
    const { spieltisch, handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /farbendieb-m1cm/ }))

    const zielspur = within(schlangenbereich).getByRole('note', { name: 'Waldtanz-Zielspur' })
    const brettwege = within(zielspur).getByRole('list', { name: 'Spielbare Brettwege' })
    const eintraege = within(brettwege).getAllByRole('listitem').map((eintrag) => eintrag.textContent)
    const gegnerlichtung = within(spieltisch).getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })

    expect(within(zielspur).getByText('1 Brettziel leuchtet')).toBeVisible()
    expect(eintraege).toContain('Gegnerziele1Tischrunde')
    expect(within(gegnerlichtung).getByRole('group', { name: 'Farbendieb-Beutekorb für rot-m1cm-beute' })).toBeVisible()
    expect(within(gegnerlichtung).getAllByRole('button', { name: /Farbendieb-Beutekorb mit Karte farbendieb-m1cm/ })).toHaveLength(2)
  })

  it('legt den Google-Stitch-Spielobjekt- und Smoke-Vertrag fuer die Zielwahl-Fährten ab', () => {
    const zielspur = cssBlock('.spielbereich--game-route [class~="waldtanz-zielspur--zielwahl-faehrten"]')
    const wege = cssBlock('.spielbereich--game-route [class~="waldtanz-zielspur__wege"]')
    const weg = cssBlock('.spielbereich--game-route [class~="waldtanz-zielspur__weg"],\n.spielbereich--game-route [class~="waldtanz-zielspur__zauberpfad"]')
    const anzahl = cssBlock('.spielbereich--game-route [class~="waldtanz-zielspur__weg-anzahl"]')

    expect(zielspur).toMatch(/background:\s*linear-gradient/)
    expect(zielspur).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(zielspur).toMatch(/box-shadow:\s*0 6px 0 var\(--st-color-border-strong\)/)
    expect(wege).toMatch(/display:\s*grid/)
    expect(wege).toMatch(/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(8rem,\s*1fr\)\)/)
    expect(weg).toMatch(/border-radius:\s*999px/)
    expect(weg).toMatch(/border:\s*2px solid var\(--st-color-border-strong\)/)
    expect(anzahl).toMatch(/font-family:\s*var\(--st-font-headline\)/)
    expect(smokeScript).toContain('M1cm Zielwahl-Fährten')
    expect(smokeScript).toContain('Spielbare Brettwege')
    expect(['m1cl_erstbild_zugknopf_smoke.mjs', 'm1cm_zielwahl_faehrten_smoke.mjs'].every(istVerdrahtet)).toBe(true)
  })
})
