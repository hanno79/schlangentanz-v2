import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, screen, within } from '@testing-library/react'
import { anwendeAktion, ermittleAktionen } from '../../engine'
import type { SpielAktion, Spielkarte, Spielzustand } from '../../engine'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { kartenname } from '../karten/kartentexte'
import { aktionMit, ausfuehren, gespieltWurde, handkarte, spieleAm, tippe, tippeZiel, zugleiste } from './__tests__/bedienen'

/*
O10, Kriterium 3: Comeback-Karte, Risiko-Karte und Schlangenkorb sind am Tisch
bedienbar, und jede Entscheidung, die die Engine dem Menschen stellt, trifft
er selbst (X3, A8.2). Jeder Test geht den Weg bis „Ausführen“ und vergleicht
den gespeicherten Stand mit dem, den die Engine aus genau dieser aufgezählten
Aktion macht (U3). Die Namen der Karten kommen aus dem Stand, nicht aus dem
Gedächtnis des Tests.
*/

afterEach(cleanup)

const knopf = (name: string | RegExp) => zugleiste().getByRole('button', { name })
const handkarteDerFarbe = (zustand: Spielzustand, spieler: number, farbe: string): Spielkarte =>
  zustand.spieler[spieler].hand.find((karte) => karte.typ === 'Farbkarte' && karte.farbe === farbe)!
const schlangenkarte = (zustand: Spielzustand, stelle: number): Spielkarte => zustand.spieler[0].schlangen[0].karten[stelle]
/** Der zugängliche Name einer Karte deiner Schlange 1 als Ziel. */
const zielInDeinerSchlange = (zustand: Spielzustand, stelle: number) => `Deine Schlange 1, Karte ${stelle + 1}: ${kartenname(schlangenkarte(zustand, stelle))}`

/** Spielt die eine aufgezählte Aktion, auf die `passt` zutrifft, mit der Engine weiter; für Stände mitten in einer Entscheidung. */
const nach = (zustand: Spielzustand, passt: (aktion: SpielAktion) => boolean) => anwendeAktion(zustand, aktionMit(zustand, passt)).zustand

describe('O10 K3: Comeback-Karte (A8.1)', () => {
  it('O10 K3/A8.1: „Comeback-Karte einsetzen“ steht in der Zugleiste, die Ansage nennt die zwei Zusatzaktionen, „Ausführen“ setzt sie ein', () => {
    const start = erzeugeSzenario('comeback-bedingung')
    spieleAm(start)
    expect(within(screen.getByRole('region', { name: 'Deine Auslage' })).getByText('einsetzbar')).toBeInTheDocument()
    tippe(knopf('Comeback-Karte einsetzen'))
    expect(zugleiste().getByText(/Ansage:.*zwei zusätzliche Aktionen/)).toBeInTheDocument()
    ausfuehren()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'ComebackEinsetzen'))).toBe(true)
  })

  it('O10 K3/A8.1: ohne erfüllte Bedingung gibt es keinen Knopf, und die Auslage sagt nicht „einsetzbar“', () => {
    spieleAm(erzeugeSzenario('comeback-rueckstand-4'))
    expect(zugleiste().queryByRole('button', { name: 'Comeback-Karte einsetzen' })).toBeNull()
    expect(within(screen.getByRole('region', { name: 'Deine Auslage' })).queryByText('einsetzbar')).toBeNull()
  })

  it('O10 K3/A8.1: eine verbrauchte Comeback-Karte heisst „verbraucht“, nie „einsetzbar“', () => {
    spieleAm(nach(erzeugeSzenario('comeback-bedingung'), (a) => a.typ === 'ComebackEinsetzen'))
    const auslage = within(screen.getByRole('region', { name: 'Deine Auslage' }))
    expect(auslage.getByText('verbraucht')).toBeInTheDocument()
    expect(auslage.queryByText('einsetzbar')).toBeNull()
  })

  it('O10 K3/D49: „Zwei Karten abwerfen, drei ziehen“: Knopf, dann zwei Handkarten, dann „Ausführen“', () => {
    const start = nach(erzeugeSzenario('comeback-abwerfen-ziehen'), (a) => a.typ === 'ComebackEinsetzen')
    spieleAm(start)
    const [erste, zweite] = start.spieler[0].hand
    tippe(knopf('Zwei Karten abwerfen, drei ziehen'))
    tippe(handkarte(erste))
    expect(zugleiste().queryByRole('button', { name: 'Ausführen' }), 'eine Karte reicht nicht').toBeNull()
    tippe(handkarte(zweite))
    ausfuehren()
    const paar = [erste.id, zweite.id].sort().join()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'ZweiAbwerfenDreiZiehen' && [...a.karteIds].sort().join() === paar))).toBe(true)
  })
})

describe('O10 K3: Risiko-Belohnungs-Karte (A8.2)', () => {
  it('O10 K3/A8.2: Aktion 1: Karte, Aktion, „Ausführen“', () => {
    const start = erzeugeSzenario('risiko-erfolg')
    spieleAm(start)
    tippe(knopf('Risiko-Karte spielen'))
    tippe(knopf('Aktion 1 (Zusätzliche Karten ziehen)'))
    expect(zugleiste().getByText(/Ansage:/)).toBeInTheDocument()
    ausfuehren()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'RisikoKarteSpielen' && a.risikoAktion === 1))).toBe(true)
  })

  it('O10 K3/D52: Aktion 2: die angesagte Farbkarte wählt man in der Hand, die Ansage nennt sie', () => {
    const start = erzeugeSzenario('risiko-erfolg')
    const rot = handkarteDerFarbe(start, 0, 'Rot')
    spieleAm(start)
    tippe(knopf('Risiko-Karte spielen'))
    tippe(knopf('Aktion 2 (Zusätzliche Farbkarte spielen)'))
    tippe(handkarte(rot))
    expect(zugleiste().getByText(/Ansage:.*Rot/)).toBeInTheDocument()
    ausfuehren()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'RisikoKarteSpielen' && a.risikoAktion === 2 && a.benannt === rot.id))).toBe(true)
  })

  it('O10 K3/A8.2: Aktion 3: die Karte zum Tauschen wählt man in deiner Schlange', () => {
    const start = erzeugeSzenario('risiko-erfolg')
    spieleAm(start)
    tippe(knopf('Risiko-Karte spielen'))
    tippe(knopf('Aktion 3 (Karten tauschen)'))
    tippeZiel(zielInDeinerSchlange(start, 1))
    ausfuehren()
    const gruen = schlangenkarte(start, 1).id
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'RisikoKarteSpielen' && a.risikoAktion === 3 && a.benannt === gruen))).toBe(true)
  })

  it('O10 K3/D52: nach Erfolg mit Aktion 2 legst du die zusätzliche Farbkarte wie sonst: Handkarte, dann Ende deiner Schlange', () => {
    const vorher = erzeugeSzenario('risiko-erfolg')
    const rot = handkarteDerFarbe(vorher, 0, 'Rot')
    const start = nach(vorher, (a) => a.typ === 'RisikoKarteSpielen' && a.risikoAktion === 2 && a.benannt === rot.id)
    spieleAm(start)
    expect(zugleiste().getByText(/Farbkarte deiner Hand an ein Ende deiner Schlange/)).toBeInTheDocument()
    tippe(handkarte(rot))
    tippeZiel('Deine Schlange 1: Ende')
    ausfuehren()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'Entscheiden' && a.wahl === `${rot.id} schlange-1 ende`))).toBe(true)
  })

  it('O10 K3/D75: nach Erfolg mit Aktion 3 tauschst du mit einer Handkarte oder verzichtest', () => {
    const vorher = erzeugeSzenario('risiko-erfolg')
    const start = nach(vorher, (a) => a.typ === 'RisikoKarteSpielen' && a.risikoAktion === 3 && a.benannt === schlangenkarte(vorher, 0).id)
    const rot = handkarteDerFarbe(start, 0, 'Rot')
    spieleAm(start)
    expect(knopf('Nicht tauschen')).toBeEnabled()
    tippe(handkarte(rot))
    ausfuehren()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'Entscheiden' && a.wahl === rot.id))).toBe(true)
  })

  it('O10 K3/D53: Misserfolg mit anderem Punktewert: Die aufgedeckte Karte liegt offen, du legst sie davor oder dahinter', () => {
    const vorher = erzeugeSzenario('risiko-erfolg')
    const start = nach(vorher, (a) => a.typ === 'RisikoKarteSpielen' && a.risikoAktion === 3 && a.benannt === schlangenkarte(vorher, 1).id)
    spieleAm(start)
    expect(within(screen.getByRole('region', { name: 'Aufgedeckt' })).getByRole('img', { name: kartenname(start.aufgedeckt[0]) })).toBeInTheDocument()
    tippe(knopf(/^Hinter Grün/))
    ausfuehren()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'Entscheiden' && a.wahl === 'dahinter'))).toBe(true)
  })

  it('O10 K3/D54: nach Erfolg mit Aktion 4 nimmst du eine Karte deiner Ablage oder ziehst', () => {
    const start = nach(erzeugeSzenario('risiko-erfolg'), (a) => a.typ === 'RisikoKarteSpielen' && a.risikoAktion === 4)
    spieleAm(start)
    expect(knopf('Oberste Karte vom Nachziehstapel')).toBeEnabled()
    tippe(knopf(`${kartenname(start.spieler[0].ablagestapel[0])} von deiner Ablage`))
    ausfuehren()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'Entscheiden' && a.wahl === 'ablagestapel-0'))).toBe(true)
  })

  it('O10 K3/A8.2: Misserfolg: du wählst den begünstigten Gegner; „Zug beenden“ steht dabei nicht da', () => {
    const start = nach(erzeugeSzenario('risiko-misserfolg'), (a) => a.typ === 'RisikoKarteSpielen' && a.risikoAktion === 1)
    spieleAm(start)
    expect(zugleiste().queryByRole('button', { name: 'Zug beenden' })).toBeNull()
    tippe(knopf('KI-Gegner 2'))
    ausfuehren()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'Entscheiden' && a.wahl === 'spieler-3'))).toBe(true)
  })

  it('O10 K3/D52, D77: als begünstigter Gegner wählst du zwischen der angesagten Karte und der obersten Stapelkarte', () => {
    const start = erzeugeSzenario('risiko-du-beguenstigt')
    const angesagt = start.spieler[1].hand.find((karte) => karte.id === start.entscheidung?.daten.benannt)
    if (angesagt === undefined) throw new Error('Testaufbau: Die angesagte Karte liegt nicht auf der Hand von KI-Gegner 1.')
    spieleAm(start)
    expect(zugleiste().getByText(/begünstigt/)).toBeInTheDocument()
    tippe(knopf(`${kartenname(angesagt)} von KI-Gegner 1`))
    ausfuehren()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'Entscheiden' && a.wahl === 'geplante'))).toBe(true)
  })
})

describe('O10 K3: Schlangenkorb des Glücks (A7.10)', () => {
  it('O10 K3/A7.10: „Ziehe 3“: Korb, Bonus, „Ausführen“; ohne Ziel kein „Entferne“', () => {
    const start = erzeugeSzenario('korb-ziehen')
    spieleAm(start)
    tippe(handkarte('Sonderkarte Schlangenkorb des Glücks'))
    expect(knopf(/^Zwei zusätzliche Aktionen/)).toBeEnabled()
    expect(zugleiste().queryByRole('button', { name: /^Entferne/ })).toBeNull()
    tippe(knopf(/^Ziehe 3 Karten/))
    ausfuehren()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'SchlangenkorbSpielen' && a.bonus.art === 'ziehen'))).toBe(true)
  })

  it('O10 K3/D44: „Tausche“: Schlangenkarte, dann Handkarte, bis zu zweimal', () => {
    const start = erzeugeSzenario('korb-tauschen')
    const gelb = handkarteDerFarbe(start, 0, 'Gelb')
    const gruen = handkarteDerFarbe(start, 0, 'Grün')
    spieleAm(start)
    tippe(handkarte('Sonderkarte Schlangenkorb des Glücks'))
    tippe(knopf(/^Tausche bis zu 2 Karten/))
    tippeZiel(zielInDeinerSchlange(start, 1))
    tippe(handkarte(gelb))
    expect(zugleiste().getByText(/Ansage:.*Gelb.*Rot/)).toBeInTheDocument()
    tippeZiel(zielInDeinerSchlange(start, 0))
    tippe(handkarte(gruen))
    ausfuehren()
    const [blau, rot] = start.spieler[0].schlangen[0].karten.map((karte) => karte.id)
    const erwartet = (a: SpielAktion) =>
      a.typ === 'SchlangenkorbSpielen' &&
      a.bonus.art === 'tauschen' &&
      a.bonus.tausch.length === 2 &&
      a.bonus.tausch.some((t) => t.karteId === rot && t.handkarteId === gelb.id) &&
      a.bonus.tausch.some((t) => t.karteId === blau && t.handkarteId === gruen.id)
    expect(gespieltWurde(start, aktionMit(start, erwartet))).toBe(true)
  })

  it('O10 K3/D45: „Entferne“: die Sonderkarte in der Schlange des Gegners', () => {
    const start = erzeugeSzenario('korb-entfernen')
    const regenbogen = start.spieler[1].schlangen[0].karten[1]
    spieleAm(start)
    tippe(handkarte('Sonderkarte Schlangenkorb des Glücks'))
    tippe(knopf(/^Entferne/))
    tippeZiel(`KI-Gegner 1, Schlange 1, Karte 2: ${kartenname(regenbogen)}`)
    ausfuehren()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'SchlangenkorbSpielen' && a.bonus.art === 'entfernen' && a.bonus.ziel.karteId === regenbogen.id))).toBe(true)
  })

  it('O10 K3/X6 (Vorrang): hältst du nur den Korb, kannst du ihn spielen; die Partie steht nicht', () => {
    const start = erzeugeSzenario('korb-allein')
    expect(ermittleAktionen(start).length, 'die Engine bietet Aktionen an').toBeGreaterThan(0)
    spieleAm(start)
    tippe(handkarte('Sonderkarte Schlangenkorb des Glücks'))
    tippe(knopf(/^Zwei zusätzliche Aktionen/))
    ausfuehren()
    expect(gespieltWurde(start, aktionMit(start, (a) => a.typ === 'SchlangenkorbSpielen' && a.bonus.art === 'aktionen'))).toBe(true)
  })
})
