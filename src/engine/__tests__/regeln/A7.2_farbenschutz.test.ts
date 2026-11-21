import { afterEach, describe, expect, it, vi } from 'vitest'
import { deserialisiere, ermittleEntscheider, serialisiere } from '../../index'
import type { KartenAktion, Sonderkartenname, Spielzustand } from '../../index'
import { KARTENREGISTER } from '../../karten/register'
import {
  ablage,
  aktionen,
  ereignisseVom,
  farbkarte,
  folge,
  FUENF,
  fuehreAus,
  grubeAuf,
  grund,
  MIT_GRUBE,
  MIT_SCHUTZ,
  reaktion,
  tischMitHaenden as tisch,
  verletzteInvarianten as verletzt,
} from '../zugablauf_hilfen'

/*
A7.2 Farbenschutz (E4, D10, D25): Er wehrt jede Sonderkarte ab, die ein
Mitspieler gegen einen Spieler oder in seine Schlange spielt; gegen Farbkarten
gibt es keine Abwehr, und als Reaktion ist nur Farbenschutz erlaubt. Die
übrigen Sonderkarten stellt ein Spion auf dem Kartenregister nach; wie jede
Karte selbst abgewehrt wird, prüft ihre eigene Datei (etwa
`A7.1_farbendieb_abwehr.test.ts`). Den allgemeinen Reaktionsablauf prüft
`A6_reaktion.test.ts`.
*/

afterEach(() => {
  vi.restoreAllMocks()
})

describe('D10/A7.2: Farbenschutz wehrt jede Sonderkarte eines Mitspielers ab', () => {
  type Ansage = (zustand: Spielzustand, karteId: string, spielerId: string) => KartenAktion
  const schlange = (zustand: Spielzustand) => zustand.spieler[1].schlangen[0]
  const karte = (zustand: Spielzustand, stelle: number) => ({ schlangenId: schlange(zustand).id, karteId: schlange(zustand).karten[stelle].id })
  const ANSAGEN: [Sonderkartenname, Ansage][] = [
    ['Regenbogenschlange', (z, karteId, spielerId) => ({ typ: 'RegenbogenschlangeLegen', spielerId, karteId, schlangenId: schlange(z).id, position: 1 })],
    ['Schlangenblockade', (z, karteId, spielerId) => ({ typ: 'BlockadeLegen', spielerId, karteId, schlangenId: schlange(z).id, position: 1 })],
    ['Farbenfusion', (z, karteId, spielerId) => ({ typ: 'FusionLegen', spielerId, karteId, schlangenId: schlange(z).id, kartenIds: [karte(z, 0).karteId, karte(z, 1).karteId] })],
    ['Farbendieb', (z, karteId, spielerId) => ({ typ: 'FarbendiebSpielen', spielerId, karteId, quelle: karte(z, 2), ziel: { art: 'neueSchlange' } })],
    ['Schlangenfrass', (z, karteId, spielerId) => ({ typ: 'SchlangenfrassSpielen', spielerId, karteId, option: 'gegnerischeKarten', ziele: [karte(z, 0), karte(z, 2)] })],
    ['Schlangengrube', (_z, karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-2' })],
    [
      'Schlangenhäutung',
      (z, karteId, spielerId) => ({ typ: 'SchlangenhaeutungSpielen', spielerId, karteId, schlangenId: schlange(z).id, neueReihenfolge: [2, 1, 0].map((stelle) => karte(z, stelle).karteId) }),
    ],
  ]

  it.each(ANSAGEN)('D10/A7.2: %s in die Schlange des Gegners: er wehrt ab, beide Karten liegen auf dem Ablagestapel ihres Spielers, keine Wirkung', (name, ansage) => {
    const definition = KARTENREGISTER[name]
    vi.spyOn(definition, 'ziele').mockImplementation((z, index, gespielt) => [ansage(z, gespielt.id, z.spieler[index].id)])
    vi.spyOn(definition, 'pruefe').mockReturnValue(null)
    vi.spyOn(definition, 'betroffene').mockReturnValue([1])
    const wirke = vi.spyOn(definition, 'wirke')
    const start = tisch([[name, 'Blau'], MIT_SCHUTZ], true).schlange(1, ['Blau', 'Blau', 'Rot']).zustand()
    const gespielt = start.spieler[0].hand[0].id
    const schutz = start.spieler[1].hand[0].id
    const vorher = serialisiere(start)
    const { zustand, ereignisse } = folge(start, (jetzt) => aktionen(jetzt).find((aktion) => 'karteId' in aktion && aktion.karteId === gespielt)!, (jetzt) => reaktion(jetzt, true))
    expect(wirke).not.toHaveBeenCalled()
    expect(ablage(zustand, 0)).toEqual([gespielt])
    expect(ablage(zustand, 1)).toEqual([schutz])
    expect(zustand.spieler[1].schlangen, 'A7.2: die Schlange des Gegners bleibt unberührt').toEqual(deserialisiere(vorher).spieler[1].schlangen)
    expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KarteAngesagt', 'AbwehrGefragt', 'Abgewehrt', 'AnsageEntschieden'])
    expect(ereignisseVom(ereignisse, 'Abgewehrt')).toEqual([{ typ: 'Abgewehrt', spielerIndex: 1, karteId: schutz, gegen: gespielt }])
    expect(verletzt(zustand)).toEqual([])
  })

  it('A6: gegen Farbkarten gibt es keine Abwehr, auch wenn sie einen Mitspieler träfe', () => {
    vi.spyOn(KARTENREGISTER.Farbkarte, 'betroffene').mockReturnValue([1])
    const start = tisch([FUENF, MIT_SCHUTZ]).zustand()
    const { zustand, ereignisse } = fuehreAus(start, farbkarte(start))
    expect(zustand.schwebend).toBeNull()
    expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KarteGespielt'])
    expect(ermittleEntscheider(zustand)).toBe(0)
  })

  it('A6/A7.8: eine Sonderkarte ohne Betroffene schwebt nicht; niemand wird gefragt', () => {
    const start = tisch([['Verdoppler', 'Blau'], MIT_SCHUTZ]).zustand()
    const { zustand, ereignisse } = fuehreAus(start, aktionen(start, 'VerdopplerSpielen')[0])
    expect(zustand.schwebend).toBeNull()
    expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KarteGespielt'])
  })
})

describe('A6, A7.2, E4 Kriterium 5: was als Reaktion erlaubt ist', () => {
  it('A6: als Reaktion ist nur Farbenschutz erlaubt; Schlangenfrass ist keine Reaktion', () => {
    const start = tisch([MIT_GRUBE, ['Farbenschutz', 'Schlangenfrass', 'Blau', 'Rot', 'Gelb']]).zustand()
    const angesagt = fuehreAus(start, grubeAuf(start, 1)).zustand
    const [schutz, frass, blau] = angesagt.spieler[1].hand.map((handkarte) => handkarte.id)
    expect(aktionen(angesagt).map((aktion) => aktion.typ === 'Reagieren' && aktion.farbenschutzId)).toEqual([schutz, null])
    expect(grund(angesagt, { typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: frass })).toMatch(/kein Farbenschutz.*\(A6\)/)
    expect(grund(angesagt, { typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: blau })).toMatch(/kein Farbenschutz.*\(A6\)/)
    const fremd = angesagt.nachziehstapel.find((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz')!.id
    expect(grund(angesagt, { typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: fremd })).toMatch(/liegt nicht auf der Hand von KI-Gegner 1/)
  })

  it('E4 Kriterium 5/A7.2: Farbenschutz ist im eigenen Zug nicht mit Wirkung spielbar, nur wirkungslos ablegbar (D25)', () => {
    const zustand = tisch([MIT_SCHUTZ, FUENF]).zustand()
    const schutz = zustand.spieler[0].hand[0].id
    const mitSchutz = aktionen(zustand).filter((aktion) => 'karteId' in aktion && aktion.karteId === schutz)
    expect(mitSchutz.map((aktion) => aktion.typ)).toEqual(['SonderkarteWirkungslosAblegen'])
    expect(KARTENREGISTER.Farbenschutz.aktionstyp).toBeNull()
    expect(grund(zustand, { typ: 'Reagieren', spielerId: 'spieler-1', farbenschutzId: schutz })).toMatch(/nichts abzuwehren/)
  })

  it('A6: wer die Karte angesagt hat, ist nicht betroffen und darf auf sie nicht reagieren', () => {
    const start = tisch([['Schlangengrube', 'Farbenschutz', 'Blau'], MIT_SCHUTZ]).zustand()
    const angesagt = fuehreAus(start, grubeAuf(start, 1)).zustand
    const eigener = angesagt.spieler[0].hand.find((karte) => karte.typ === 'Sonderkarte')!.id
    expect(grund(angesagt, { typ: 'Reagieren', spielerId: 'spieler-1', farbenschutzId: eigener })).toMatch(/entscheidet gerade nicht/)
  })
})
