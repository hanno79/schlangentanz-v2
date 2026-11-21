import { describe, expect, it } from 'vitest'
import { ermittleEntscheider, werteSchlangen } from '../index'
import type { SchlangenfrassSpielenAktion, SpielAktion, Spielzustand } from '../index'
import type { Kartenwahl, Schlangenglied } from '../testing/szenario'
import {
  ablage,
  aktionen,
  durchlassen,
  folge,
  FUENF,
  fuehreAus,
  grund,
  MIT_SCHUTZ,
  tischMitHaenden as tisch,
  typen,
  verletzteInvarianten,
} from './zugablauf_hilfen'

/*
E6, Schlangenfrass (A7.4 mit allen drei Beispielen, A7.7, A5, D12, D13, D25):
die drei Optionen, welche Karten Ziel sind, „zwei, sofern möglich“, Lücken,
leere Schlangen, Fusionen und Joker. Die Abwehr bei Option c) prüft
`schlangenfrass_abwehr.test.ts`.
*/

type Option = SchlangenfrassSpielenAktion['option']

const MIT_FRASS: Kartenwahl[] = ['Schlangenfrass', 'Blau', 'Rot', 'Gelb', 'Grün']

function frassAktionen(zustand: Spielzustand, option?: Option): SchlangenfrassSpielenAktion[] {
  return aktionen(zustand, 'SchlangenfrassSpielen').filter(
    (aktion): aktion is SchlangenfrassSpielenAktion => aktion.typ === 'SchlangenfrassSpielen' && (option === undefined || aktion.option === option),
  )
}

/** Die gefressenen Karten jeder aufgezählten Aktion dieser Option. */
function zielIds(zustand: Spielzustand, option: Option): string[][] {
  return frassAktionen(zustand, option).map((aktion) => aktion.ziele.map((ziel) => ziel.karteId))
}

/** Die aufgezählte Aktion dieser Option, die genau diese Karten frisst, in beliebiger Reihenfolge. */
function frass(zustand: Spielzustand, option: Option, ...karteIds: string[]): SchlangenfrassSpielenAktion {
  const gesucht = [...karteIds].sort().join(',')
  const passend = frassAktionen(zustand, option).find((aktion) => aktion.ziele.map((ziel) => ziel.karteId).sort().join(',') === gesucht)
  expect(passend, `Schlangenfrass ${option} auf ${karteIds.join(', ')} ist nicht aufgezählt`).toBeDefined()
  return passend!
}

/** Eine selbst gebaute Aktion, für Tests, die eine unerlaubte Wahl zeigen. */
function gebaut(zustand: Spielzustand, option: Option, ...karteIds: string[]): SchlangenfrassSpielenAktion {
  const spieler = zustand.spieler[zustand.zug.spielerIndex]
  const frassId = spieler.hand.find((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenfrass')!.id
  const ziele = karteIds.map((karteId) => ({ schlangenId: schlangeMit(zustand, karteId) ?? 'schlange-99', karteId }))
  return { typ: 'SchlangenfrassSpielen', spielerId: spieler.id, karteId: frassId, option, ziele }
}

function schlangeMit(zustand: Spielzustand, karteId: string): string | undefined {
  const alle = zustand.spieler.flatMap((spieler) => spieler.schlangen)
  return alle.find((schlange) => schlange.karten.some((karte) => karte.id === karteId))?.id
}

/** Die Ids der Karten in der `nummer`-ten Schlange des Spielers. */
function ids(zustand: Spielzustand, spieler: number, nummer = 0): string[] {
  return zustand.spieler[spieler].schlangen[nummer].karten.map((karte) => karte.id)
}

/** Farbe bzw. Name jeder Karte in der Schlange, lesbar für die Beispiele der Website. */
function glieder(zustand: Spielzustand, spieler: number, nummer = 0): string[] {
  return zustand.spieler[spieler].schlangen[nummer].karten.map((karte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name))
}

function frassId(zustand: Spielzustand, spieler = 0): string {
  return zustand.spieler[spieler].hand.find((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenfrass')!.id
}

/** Zwei Spieler; Spieler 1 hält den Schlangenfrass und hat diese Schlangen, Spieler 2 hält `gegnerhand` und hat seine. */
function zweiSpieler(eigene: Schlangenglied[][], fremde: Schlangenglied[][] = [], gegnerhand: Kartenwahl[] = FUENF): Spielzustand {
  const bau = tisch([MIT_FRASS, gegnerhand])
  eigene.forEach((schlange) => bau.schlange(0, schlange))
  fremde.forEach((schlange) => bau.schlange(1, schlange))
  return bau.zustand()
}

describe('A7.4 a) und b): Karten aus der eigenen Schlange', () => {
  it('A7.4 a): jede Karte jeder eigenen Schlange ist ein Ziel, auch Joker, Fusion und Blockade; b) nur die eigene Blockade', () => {
    const zustand = zweiSpieler([['Rot', 'Regenbogenschlange', 'Schlangenblockade'], [{ fusion: ['Gelb', 'Gelb'] }, 'Blau']])
    expect(zielIds(zustand, 'eigeneKarte')).toEqual([...ids(zustand, 0, 0), ...ids(zustand, 0, 1)].map((id) => [id]))
    expect(zielIds(zustand, 'eigeneBlockade')).toEqual([[ids(zustand, 0, 0)[2]]])
    expect(zielIds(zustand, 'gegnerischeKarten'), 'A7.4 c): der Gegner hat keine Schlange').toEqual([])
    expect(typen(zustand), 'D25: mit möglichem Ziel lässt er sich nicht wirkungslos ablegen').not.toContain('SonderkarteWirkungslosAblegen')
  })

  it('A7.4 Beispiel a): eine rote Karte aus der eigenen Schlange; sie und der Schlangenfrass liegen auf dem eigenen Ablagestapel, niemand wird gefragt', () => {
    const start = zweiSpieler([['Blau', 'Rot', 'Gelb']], [['Grün', 'Grün']], MIT_SCHUTZ)
    const [blau, rot, gelb] = ids(start, 0)
    const { zustand, ereignisse } = fuehreAus(start, frass(start, 'eigeneKarte', rot))
    const schlangenId = start.spieler[0].schlangen[0].id
    expect(ereignisse).toEqual([
      {
        typ: 'KartenVersetzt',
        spielerIndex: 0,
        karteId: frassId(start),
        karten: [{ karteId: rot, von: { ort: 'Schlange', spielerIndex: 0, schlangenId, position: 1 }, nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } }],
        aufgeloest: [],
      },
      { typ: 'KarteGespielt', spielerIndex: 0, karteId: frassId(start), aktion: 'SchlangenfrassSpielen', nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } },
    ])
    expect(zustand.schwebend, 'A6/D10: a) trifft keinen Mitspieler, auch wenn er Farbenschutz hält').toBeNull()
    expect(ermittleEntscheider(zustand)).toBe(0)
    expect(ids(zustand, 0), 'Grenzfall: Karte aus der Mitte, die Nachbarn schliessen auf').toEqual([blau, gelb])
    expect(ablage(zustand, 0)).toEqual([frassId(start), rot])
    expect(ablage(zustand, 1)).toEqual([])
    expect(verletzteInvarianten(zustand)).toEqual([])
  })

  it('A7.4 Beispiel b)/A7.5: die Blockade aus Rot, Blockade, Rot, Rot geht auf den Ablagestapel des Spielers, der Schlangenfrass gespielt hat; die Dreierreihe zählt wieder', () => {
    const start = zweiSpieler([['Rot', 'Schlangenblockade', 'Rot', 'Rot']])
    const blockade = ids(start, 0)[1]
    expect(werteSchlangen(start.spieler[0].schlangen, false).gruppenPunkte).toBe(0)
    const { zustand } = fuehreAus(start, frass(start, 'eigeneBlockade', blockade))
    expect(glieder(zustand, 0)).toEqual(['Rot', 'Rot', 'Rot'])
    expect(werteSchlangen(zustand.spieler[0].schlangen, false).gruppenPunkte).toBe(3)
    expect(ablage(zustand, 0)).toEqual([frassId(start), blockade])
  })

  it('A7.4 a)/b): eine eigene Blockade lässt sich mit a) wie mit b) fressen; beide wirken gleich', () => {
    const start = zweiSpieler([['Rot', 'Schlangenblockade', 'Rot']])
    const blockade = ids(start, 0)[1]
    const mitA = fuehreAus(start, frass(start, 'eigeneKarte', blockade)).zustand
    const mitB = fuehreAus(start, frass(start, 'eigeneBlockade', blockade)).zustand
    expect(mitA).toEqual(mitB)
  })

  it('A7.4 b): b) frisst nur eine Schlangenblockade; eine andere eigene Karte wird mit Grund abgelehnt', () => {
    const start = zweiSpieler([['Rot', 'Blau']])
    expect(zielIds(start, 'eigeneBlockade')).toEqual([])
    expect(grund(start, gebaut(start, 'eigeneBlockade', ids(start, 0)[0]))).toMatch(/nur eine Schlangenblockade.*\(A7\.4\)/)
  })

  it('A7.4 a)/b): aus der Schlange eines Mitspielers fressen a) und b) nicht', () => {
    const start = zweiSpieler([['Rot']], [['Blau', 'Schlangenblockade', 'Blau']])
    const [blau, blockade] = ids(start, 1)
    expect(grund(start, gebaut(start, 'eigeneKarte', blau))).toMatch(/eigenen Schlange.*\(A7\.4\)/)
    expect(grund(start, gebaut(start, 'eigeneBlockade', blockade))).toMatch(/eigenen Schlange.*\(A7\.4\)/)
  })

  it('A7.4 a): a) frisst genau eine Karte, nicht zwei', () => {
    const start = zweiSpieler([['Rot', 'Blau']])
    expect(grund(start, gebaut(start, 'eigeneKarte', ...ids(start, 0)))).toMatch(/genau eine Karte \(A7\.4\)/)
  })
})

describe('A7.4 c): zwei Karten aus den Schlangen der Mitspieler', () => {
  it('A7.4 c): jedes Paar aus einer oder zwei Schlangen, auch verschiedener Mitspieler, von beliebigen Stellen; eigene Karten nicht', () => {
    const start = tisch([MIT_FRASS, FUENF, FUENF]).schlange(0, ['Grün']).schlange(1, ['Blau', 'Rot']).schlange(2, ['Gelb']).zustand()
    const [blau, rot] = ids(start, 1)
    const [gelb] = ids(start, 2)
    expect(zielIds(start, 'gegnerischeKarten')).toEqual([
      [blau, rot],
      [blau, gelb],
      [rot, gelb],
    ])
    expect(grund(start, gebaut(start, 'gegnerischeKarten', blau, ids(start, 0)[0]))).toMatch(/nur aus den Schlangen der Mitspieler.*\(A7\.4\)/)
  })

  it('A7.4 c)/E6 Kriterium 2: gibt es zwei erlaubte Ziele, müssen es zwei sein; eine allein wird abgelehnt', () => {
    const start = zweiSpieler([], [['Blau', 'Rot']])
    expect(zielIds(start, 'gegnerischeKarten')).toEqual([ids(start, 1)])
    expect(grund(start, gebaut(start, 'gegnerischeKarten', ids(start, 1)[0]))).toMatch(/zwei Karten entfernt werden, sofern möglich.*\(A7\.4\)/)
  })

  it('A7.4 c)/E6 Grenzfall: nur ein gegnerisches Ziel am Tisch: c) frisst diese eine', () => {
    const start = zweiSpieler([], [['Blau', 'Schlangenblockade']])
    const [blau, blockade] = ids(start, 1)
    expect(zielIds(start, 'gegnerischeKarten')).toEqual([[blau]])
    const { zustand } = folge(start, (jetzt) => frass(jetzt, 'gegnerischeKarten', blau), durchlassen)
    expect(ids(zustand, 1)).toEqual([blockade])
    expect(ablage(zustand, 0)).toEqual([frassId(start), blau])
  })

  it('A7.4 c)/E6 Kriterium 3: gegnerische Blockaden sind kein Ziel; eine Blockade als Ziel wird mit Grund abgelehnt', () => {
    const start = zweiSpieler([], [['Blau', 'Schlangenblockade', 'Rot', 'Schlangenblockade']])
    const [blau, blockade, rot] = ids(start, 1)
    expect(zielIds(start, 'gegnerischeKarten')).toEqual([[blau, rot]])
    expect(grund(start, gebaut(start, 'gegnerischeKarten', blau, blockade))).toMatch(/Schlangenblockaden in gegnerischen Schlangen.*\(A7\.4\)/)
  })

  it('A7.4 c)/E6 Grenzfall: liegen beim Gegner nur Blockaden, gibt es kein c); ohne eigene Schlange ist der Schlangenfrass wirkungslos ablegbar (D13)', () => {
    const ohneEigene = zweiSpieler([], [['Schlangenblockade']])
    expect(frassAktionen(ohneEigene)).toEqual([])
    expect(aktionen(ohneEigene, 'SonderkarteWirkungslosAblegen')).toEqual([
      { typ: 'SonderkarteWirkungslosAblegen', spielerId: 'spieler-1', karteId: frassId(ohneEigene) },
    ])
    const mitEigener = zweiSpieler([['Rot']], [['Schlangenblockade']])
    expect(frassAktionen(mitEigener).map((aktion) => aktion.option)).toEqual(['eigeneKarte'])
  })

  it('A7.4 c): beide Karten in beliebiger Schreibweise ergeben dasselbe wie die aufgezählte Aktion', () => {
    const start = zweiSpieler([], [['Blau', 'Rot', 'Gelb']])
    const [blau, , gelb] = ids(start, 1)
    const aufgezaehlt = frass(start, 'gegnerischeKarten', blau, gelb)
    const umgekehrt: SpielAktion = { ...aufgezaehlt, ziele: [...aufgezaehlt.ziele].reverse() }
    const erst = folge(start, () => aufgezaehlt, durchlassen).zustand
    const zweit = folge(start, () => umgekehrt, durchlassen).zustand
    expect(zweit).toEqual(erst)
    expect(ablage(erst, 0)).toEqual([frassId(start), blau, gelb])
  })
})

describe('A7.4: Ziele, die es nicht gibt, und die Grenze je Zug', () => {
  it('A7.4: dieselbe Karte zweimal, eine Karte ausserhalb der genannten Schlange und eine Karte unter einer Fusion werden abgelehnt', () => {
    const start = zweiSpieler([], [['Blau', { fusion: ['Gelb', 'Gelb'] }, 'Rot']])
    const [blau] = ids(start, 1)
    const unter = start.spieler[1].schlangen[0].fusionen[0].unter[0].id
    expect(grund(start, gebaut(start, 'gegnerischeKarten', blau, blau))).toMatch(/höchstens einmal \(A7\.4\)/)
    expect(grund(start, gebaut(start, 'gegnerischeKarten', blau, unter))).toMatch(new RegExp(`${unter} liegt nicht in der Schlange.*\\(A7\\.4\\)`))
    const falscheSchlange = { ...gebaut(start, 'gegnerischeKarten', blau, ids(start, 1)[2]), ziele: [{ schlangenId: 'schlange-9', karteId: blau }] }
    expect(grund(start, falscheSchlange)).toMatch(/liegt nicht in der Schlange schlange-9/)
  })

  it('D13/D25: ohne Schlange am Tisch hat der Schlangenfrass kein Ziel und ist wirkungslos ablegbar; mit Ziel nicht', () => {
    const leer = zweiSpieler([])
    expect(frassAktionen(leer)).toEqual([])
    expect(typen(leer)).toContain('SonderkarteWirkungslosAblegen')
    const mitZiel = zweiSpieler([], [['Blau']])
    expect(grund(mitZiel, { typ: 'SonderkarteWirkungslosAblegen', spielerId: 'spieler-1', karteId: frassId(mitZiel) })).toMatch(/mögliches Ziel.*\(D25\)/)
  })

  it('A5/D12: der Schlangenfrass ist die Sonderkarte des Zuges; danach geht noch eine Farbkarte, aber keine zweite Sonderkarte', () => {
    const bau = tisch([['Schlangenfrass', 'Schlangenfrass', 'Blau'], FUENF]).schlange(0, ['Rot', 'Gelb'])
    const start = bau.zustand()
    const { zustand } = fuehreAus(start, frass(start, 'eigeneKarte', ids(start, 0)[0]))
    expect(zustand.zug).toMatchObject({ gespielteSonderkarten: 1, gespielteFarbkarten: 0 })
    expect(typen(zustand)).toEqual(['FarbkarteLegen', 'ZugBeenden'])
  })
})

describe('A7.4/A7.7: leere Schlangen, Fusionen und Joker', () => {
  it('A7.4/E6 Grenzfall: frisst a) die letzte Karte einer Schlange, verschwindet die Schlange; danach darf der Spieler wieder eine neue beginnen', () => {
    const start = zweiSpieler([['Rot'], ['Blau', 'Blau']])
    const [rot] = ids(start, 0, 0)
    const { zustand } = fuehreAus(start, frass(start, 'eigeneKarte', rot))
    expect(zustand.spieler[0].schlangen.map((schlange) => schlange.id)).toEqual([start.spieler[0].schlangen[1].id])
    expect(aktionen(zustand, 'FarbkarteLegen')).toContainEqual(expect.objectContaining({ ziel: { art: 'neueSchlange' } }))
    expect(verletzteInvarianten(zustand)).toEqual([])
  })

  it('A7.4/E6 Grenzfall: frisst c) beide Karten einer gegnerischen Schlange, verschwindet sie; frisst c) zwei aus der Mitte, schliessen die Nachbarn auf', () => {
    const start = zweiSpieler([], [['Blau', 'Rot'], ['Gelb', 'Grün', 'Violett', 'Braun']])
    const [blau, rot] = ids(start, 1, 0)
    const ganz = folge(start, (jetzt) => frass(jetzt, 'gegnerischeKarten', blau, rot), durchlassen).zustand
    expect(ganz.spieler[1].schlangen.map((schlange) => schlange.id)).toEqual([start.spieler[1].schlangen[1].id])
    const [gelb, gruen, violett, braun] = ids(start, 1, 1)
    const mitte = folge(start, (jetzt) => frass(jetzt, 'gegnerischeKarten', gruen, violett), durchlassen).zustand
    expect(ids(mitte, 1, 1)).toEqual([gelb, braun])
    expect(verletzteInvarianten(ganz)).toEqual([])
    expect(verletzteInvarianten(mitte)).toEqual([])
  })

  it('A7.4/A7.7/E6 Kriterium 6: wird eine Farbenfusion gefressen, geht nur sie weg; die beiden Karten darunter liegen einzeln an ihrer Stelle, links zuerst', () => {
    const start = zweiSpieler([['Blau', { fusion: ['Gelb', 'Gelb'] }, 'Rot']])
    const [blau, fusion, rot] = ids(start, 0)
    const [links, rechts] = start.spieler[0].schlangen[0].fusionen[0].unter.map((karte) => karte.id)
    const { zustand } = fuehreAus(start, frass(start, 'eigeneKarte', fusion))
    expect(ids(zustand, 0)).toEqual([blau, links, rechts, rot])
    expect(zustand.spieler[0].schlangen[0].fusionen).toEqual([])
    expect(ablage(zustand, 0), 'A7.4: nur die Farbenfusion selbst wird entfernt').toEqual([frassId(start), fusion])
    expect(verletzteInvarianten(zustand)).toEqual([])
  })

  it('A7.4/A7.7: eine Fusion als einzige Karte einer Schlange: die Schlange bleibt, mit den beiden Karten darunter', () => {
    const start = zweiSpieler([[{ fusion: ['Grün', 'Grün'] }]])
    const unter = start.spieler[0].schlangen[0].fusionen[0].unter.map((karte) => karte.id)
    const { zustand } = fuehreAus(start, frass(start, 'eigeneKarte', ids(start, 0)[0]))
    expect(ids(zustand, 0)).toEqual(unter)
    expect(verletzteInvarianten(zustand)).toEqual([])
  })

  it('A7.4/A7.7: c) frisst beim Gegner eine Fusion und ihren Nachbarn; die zwei Karten der Fusion bleiben dort, die übrigen Fusionen bleiben Fusionen', () => {
    const start = zweiSpieler([], [['Rot', { fusion: ['Blau', 'Blau'] }, { fusion: ['Gelb', 'Gelb'] }]])
    const [rot, blauFusion, gelbFusion] = ids(start, 1)
    const [blau1, blau2] = start.spieler[1].schlangen[0].fusionen[0].unter.map((karte) => karte.id)
    const { zustand } = folge(start, (jetzt) => frass(jetzt, 'gegnerischeKarten', rot, blauFusion), durchlassen)
    expect(ids(zustand, 1)).toEqual([blau1, blau2, gelbFusion])
    expect(zustand.spieler[1].schlangen[0].fusionen.map((eintrag) => eintrag.karteId)).toEqual([gelbFusion])
    expect(ablage(zustand, 0)).toEqual([frassId(start), rot, blauFusion])
    expect(verletzteInvarianten(zustand)).toEqual([])
  })

  it('A7.4 Beispiel c): Regenbogenschlange und eine Gelb aus Regenbogenschlange, Gelb, Gelb, Gelb: es bleiben zwei Gelb ohne Punkte', () => {
    const start = zweiSpieler([], [['Regenbogenschlange', 'Gelb', 'Gelb', 'Gelb']])
    const [regenbogen, gelb] = ids(start, 1)
    expect(werteSchlangen(start.spieler[1].schlangen, false).gruppenPunkte).toBe(3)
    const { zustand } = folge(start, (jetzt) => frass(jetzt, 'gegnerischeKarten', regenbogen, gelb), durchlassen)
    expect(glieder(zustand, 1)).toEqual(['Gelb', 'Gelb'])
    expect(werteSchlangen(zustand.spieler[1].schlangen, false).gruppenPunkte).toBe(0)
  })

  it('A7.4/A11/E6 Grenzfall: ein gefressener Joker lässt eine Gruppe zerfallen, Regenbogenschlange wie Farbenfusion', () => {
    const regenbogen = zweiSpieler([['Rot', 'Regenbogenschlange', 'Rot']])
    expect(werteSchlangen(regenbogen.spieler[0].schlangen, false).gruppenPunkte).toBe(2)
    const ohneRegenbogen = fuehreAus(regenbogen, frass(regenbogen, 'eigeneKarte', ids(regenbogen, 0)[1])).zustand
    expect(werteSchlangen(ohneRegenbogen.spieler[0].schlangen, false).gruppenPunkte).toBe(0)

    const fusion = zweiSpieler([['Rot', 'Rot', { fusion: ['Blau', 'Blau'] }]])
    expect(werteSchlangen(fusion.spieler[0].schlangen, false).gruppenPunkte, 'A7.7/D30: die Fusion vervollständigt Rot und bringt 1 + 1').toBe(4)
    const ohneFusion = fuehreAus(fusion, frass(fusion, 'eigeneKarte', ids(fusion, 0)[2])).zustand
    expect(glieder(ohneFusion, 0)).toEqual(['Rot', 'Rot', 'Blau', 'Blau'])
    expect(werteSchlangen(ohneFusion.spieler[0].schlangen, false).gruppenPunkte).toBe(0)
  })
})
