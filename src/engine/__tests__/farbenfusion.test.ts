import { describe, expect, it } from 'vitest'
import { deserialisiere, ermittleAktionen, ermittleEntscheider, serialisiere } from '../index'
import type { FusionLegenAktion, SpielAktion, Spielkarte, Spielzustand } from '../index'
import type { Baukasten, Kartenwahl } from '../testing/szenario'
import {
  ablage,
  aktionen,
  ereignisseVom,
  farbkarte,
  folge,
  FUENF,
  fuehreAus,
  grund,
  MIT_SCHUTZ,
  reaktion,
  tischMitHaenden,
  verletzteInvarianten,
  zugBeenden,
} from './zugablauf_hilfen'

/*
E7, Farbenfusion legen: A7.7 (Text, Wichtige Regeln), D9 (jede Karte in jede
Schlange), D10 und A6 (abwehrbar in der Schlange eines Mitspielers), D20 (nur
zwei Farbkarten derselben Farbe), D27 (je Zug eine), D13 und D25 (wirkungslos
nur ohne Ziel). Was die Fusion in der Wertung bringt, prüfen
`wertung_farbgruppen.test.ts` und `farbenfusion_wertung.test.ts`.
*/

const MIT_FUSION: Kartenwahl[] = ['Farbenfusion', 'Blau', 'Rot', 'Gelb', 'Grün']

/** Spieler 1 hält eine Farbenfusion, die Mitspieler halten `gegner`. */
function tisch(spielerzahl = 2, gegner: Kartenwahl[] = FUENF): Baukasten {
  return tischMitHaenden([MIT_FUSION, ...Array.from({ length: spielerzahl - 1 }, () => gegner)])
}

function ids(zustand: Spielzustand, spieler: number): string[] {
  return zustand.spieler[spieler].schlangen[0].karten.map((karte) => karte.id)
}

function art(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte' ? karte.farbe : karte.name
}

function arten(zustand: Spielzustand, spieler: number): string[] {
  return zustand.spieler[spieler].schlangen[0].karten.map(art)
}

function fusionskarte(zustand: Spielzustand, spieler = 0): string {
  const karte = zustand.spieler[spieler].hand.find((handkarte) => art(handkarte) === 'Farbenfusion')
  if (karte === undefined) throw new Error(`Testaufbau: Spieler ${spieler} hält keine Farbenfusion`)
  return karte.id
}

function fusionen(zustand: Spielzustand): FusionLegenAktion[] {
  return aktionen(zustand, 'FusionLegen') as FusionLegenAktion[]
}

/** Die aufgezählte Fusion mit der ersten Farbenfusion der Hand auf die Karten an den Stellen `links` und `links + 1` der ersten Schlange von `besitzer`. */
function fusionAuf(zustand: Spielzustand, besitzer: number, links: number): FusionLegenAktion {
  const schlange = zustand.spieler[besitzer].schlangen[0]
  const erwartet = [schlange.karten[links].id, schlange.karten[links + 1].id]
  const karteId = fusionskarte(zustand, zustand.zug.spielerIndex)
  const passend = fusionen(zustand).filter(
    (aktion) => aktion.karteId === karteId && aktion.schlangenId === schlange.id && aktion.kartenIds.join() === erwartet.join(),
  )
  expect(passend, `FusionLegen auf ${erwartet.join(', ')} in ${schlange.id} ist nicht aufgezählt`).toHaveLength(1)
  return passend[0]
}

/** Die Handkarten, die die Engine zum wirkungslosen Ablegen anbietet (D13, D25). */
function wirkungslosAblegbar(zustand: Spielzustand): string[] {
  return aktionen(zustand, 'SonderkarteWirkungslosAblegen').flatMap((aktion) => ('karteId' in aktion ? [aktion.karteId] : []))
}

/** Eine Fusion, wie sie ein Aufrufer selbst bauen könnte, um eine unerlaubte zu zeigen. */
function selbstGebaut(zustand: Spielzustand, schlangenId: string, kartenIds: string[]): SpielAktion {
  return { typ: 'FusionLegen', spielerId: 'spieler-1', karteId: fusionskarte(zustand), schlangenId, kartenIds } as SpielAktion
}

describe('A7.7: zwei nebeneinanderliegende Farbkarten gleicher Farbe kommen unter die Fusion (Kriterium 1)', () => {
  it('A7.7: jede Stelle mit zwei gleichfarbigen Nachbarn ist ein Ziel, links zuerst', () => {
    const zustand = tisch().schlange(0, ['Blau', 'Blau', 'Gelb', 'Gelb']).zustand()
    const [b1, b2, g1, g2] = ids(zustand, 0)
    expect(fusionen(zustand).map((aktion) => aktion.kartenIds)).toEqual([
      [b1, b2],
      [g1, g2],
    ])
  })

  it('A7.7: die beiden Farbkarten bleiben unter der Fusion in der Schlange erhalten, die Fusion liegt obenauf an ihrer Stelle', () => {
    const start = tisch().schlange(0, ['Blau', 'Blau', 'Gelb', 'Gelb']).zustand()
    const [b1, b2, g1, g2] = ids(start, 0)
    const gelbe = start.spieler[0].schlangen[0].karten.slice(2)
    const fusion = fusionskarte(start)
    const { zustand } = fuehreAus(start, fusionAuf(start, 0, 2))
    expect(ids(zustand, 0)).toEqual([b1, b2, fusion])
    expect(zustand.spieler[0].schlangen[0].fusionen).toEqual([{ karteId: fusion, unter: gelbe }])
    expect(zustand.spieler[0].schlangen[0].fusionen[0].unter.map((karte) => karte.id), 'A7.4: die Reihenfolge darunter bleibt').toEqual([g1, g2])
    expect(zustand.spieler[0].hand.map((karte) => karte.id)).not.toContain(fusion)
    expect(ablage(zustand, 0), 'A7.7: die Fusion bleibt in der Schlange, nicht auf dem Ablagestapel').toEqual([])
    expect(verletzteInvarianten(zustand)).toEqual([])
  })

  it('A7.4/A7.7: unter der Fusion liegen die Karten links zuerst, in der Reihenfolge der Schlange, auch beim Mitspieler', () => {
    const start = tisch().schlange(0, [{ id: 'gelb-09' }, { id: 'gelb-04' }]).schlange(1, [{ id: 'rot-12' }, { id: 'rot-07' }]).zustand()
    const eigen = fuehreAus(start, fusionAuf(start, 0, 0)).zustand
    expect(eigen.spieler[0].schlangen[0].fusionen[0].unter.map((karte) => karte.id)).toEqual(['gelb-09', 'gelb-04'])
    const beimGegner = folge(start, (jetzt) => fusionAuf(jetzt, 1, 0), (jetzt) => reaktion(jetzt, false)).zustand
    expect(beimGegner.spieler[1].schlangen[0].fusionen[0].unter.map((karte) => karte.id)).toEqual(['rot-12', 'rot-07'])
  })

  it('A7.7: Karten, die nicht nebeneinanderliegen, sind kein Ziel und werden abgelehnt', () => {
    const zustand = tisch().schlange(0, ['Gelb', 'Blau', 'Gelb']).zustand()
    const [g1, , g2] = ids(zustand, 0)
    expect(fusionen(zustand)).toEqual([])
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', [g1, g2]))).toMatch(/nebeneinander.*A7\.7/)
  })

  it('A7.7: zwei Nachbarn verschiedener Farbe sind kein Ziel und werden abgelehnt', () => {
    const zustand = tisch().schlange(0, ['Gelb', 'Blau']).zustand()
    expect(fusionen(zustand)).toEqual([])
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', ids(zustand, 0)))).toMatch(/gleiche[nr]? Farbe.*A7\.7/)
  })

  it('A7.7: links zuerst; dieselben Karten in vertauschter Folge und dieselbe Karte zweimal werden abgelehnt', () => {
    const zustand = tisch().schlange(0, ['Rot', 'Rot']).zustand()
    const [r1, r2] = ids(zustand, 0)
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', [r2, r1]))).toMatch(/links zuerst/)
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', [r1, r1]))).toMatch(/zwei verschiedene Karten/)
  })

  it('A7.7: eine unbekannte Schlange und eine Karte, die nicht in der genannten Schlange liegt, werden abgelehnt', () => {
    const zustand = tisch().schlange(0, ['Rot', 'Rot']).schlange(1, ['Rot']).zustand()
    const [r1, r2] = ids(zustand, 0)
    const fremd = ids(zustand, 1)[0]
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-9', [r1, r2]))).toMatch(/Schlange schlange-9 gibt es nicht/)
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', [r2, fremd]))).toMatch(new RegExp(`${fremd} liegt nicht in der Schlange schlange-1`))
  })
})

describe('D20: nur zwei Farbkarten derselben Farbe', () => {
  it('D20: eine Farbkarte und eine Regenbogenschlange gelten nicht als zwei Karten gleicher Farbe', () => {
    const zustand = tisch().schlange(0, ['Rot', 'Regenbogenschlange', 'Rot']).zustand()
    const [rot, regenbogen] = ids(zustand, 0)
    expect(fusionen(zustand)).toEqual([])
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', [rot, regenbogen]))).toMatch(/nur zwei Farbkarten.*D20/)
  })

  it('D20: eine Schlangenblockade lässt sich nicht fusionieren', () => {
    const zustand = tisch().schlange(0, ['Gelb', 'Schlangenblockade', 'Gelb']).zustand()
    const [gelb, blockade] = ids(zustand, 0)
    expect(fusionen(zustand)).toEqual([])
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', [gelb, blockade]))).toMatch(/D20/)
  })

  it('D20: eine liegende Fusion und eine Farbkarte lassen sich nicht noch einmal fusionieren, die Karten darunter auch nicht', () => {
    const zustand = tisch().schlange(0, ['Rot', { fusion: ['Rot', 'Rot'] }]).zustand()
    const [rot, fusion] = ids(zustand, 0)
    const unter = zustand.spieler[0].schlangen[0].fusionen[0].unter.map((karte) => karte.id)
    expect(fusionen(zustand)).toEqual([])
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', [rot, fusion]))).toMatch(/D20/)
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', unter))).toMatch(/liegt unter der Farbenfusion/)
  })
})

describe('D13/D25: wirkungslos ablegen nur ohne Ziel', () => {
  it('D13: ohne zwei gleichfarbige Nachbarn am Tisch hat die Fusion kein Ziel und lässt sich nur wirkungslos ablegen', () => {
    const zustand = tisch().schlange(0, ['Gelb', 'Blau']).schlange(1, ['Rot', 'Gelb']).zustand()
    const fusion = fusionskarte(zustand)
    expect(wirkungslosAblegbar(zustand)).toContain(fusion)
  })

  it('D25: hat die Fusion ein Ziel, auch nur beim Gegner, bietet die Engine kein wirkungsloses Ablegen an und lehnt es ab', () => {
    const zustand = tisch().schlange(1, ['Rot', 'Rot']).zustand()
    const fusion = fusionskarte(zustand)
    expect(fusionen(zustand)).toHaveLength(1)
    expect(wirkungslosAblegbar(zustand)).not.toContain(fusion)
    expect(grund(zustand, { typ: 'SonderkarteWirkungslosAblegen', spielerId: 'spieler-1', karteId: fusion })).toMatch(/D25/)
  })
})

describe('D9: die Fusion geht in jede Schlange am Tisch', () => {
  it('D9: aufgezählt sind die Paare in den eigenen und in allen gegnerischen Schlangen', () => {
    const zustand = tisch(3).schlange(0, ['Grün', 'Grün']).schlange(1, ['Rot', 'Rot']).schlange(2, ['Blau', 'Gelb', 'Gelb']).zustand()
    expect(fusionen(zustand).map((aktion) => aktion.schlangenId)).toEqual(['schlange-1', 'schlange-2', 'schlange-3'])
  })

  it('A6/D10: in die eigene Schlange wirkt sie sofort; niemand wird gefragt, auch wenn Mitspieler Farbenschutz halten', () => {
    const start = tisch(2, MIT_SCHUTZ).schlange(0, ['Gelb', 'Gelb']).zustand()
    const fusion = fusionskarte(start)
    const { zustand, ereignisse } = fuehreAus(start, fusionAuf(start, 0, 0))
    expect(zustand.schwebend).toBeNull()
    expect(ereignisse).toEqual([
      { typ: 'KarteGespielt', spielerIndex: 0, karteId: fusion, aktion: 'FusionLegen', nach: { ort: 'Schlange', spielerIndex: 0, schlangenId: 'schlange-1', position: 0 } },
    ])
    expect(ermittleEntscheider(zustand)).toBe(0)
  })
})

describe('D10/A6/A7.2: in der Schlange eines Mitspielers ist die Fusion abwehrbar (Kriterium 4)', () => {
  it('A6/D33: sie wird mit Ziel angesagt, und gefragt wird der Besitzer der Schlange, auch ohne Farbenschutz', () => {
    const start = tisch().schlange(1, ['Rot', 'Rot', 'Rot']).zustand()
    const ansage = fusionAuf(start, 1, 0)
    const { zustand, ereignisse } = fuehreAus(start, ansage)
    expect(ereignisse).toEqual([
      { typ: 'KarteAngesagt', spielerIndex: 0, karteId: ansage.karteId, ansage, betroffene: [1] },
      { typ: 'AbwehrGefragt', spielerIndex: 1, karteId: ansage.karteId },
    ])
    expect(ermittleEntscheider(zustand)).toBe(1)
    expect(ermittleAktionen(zustand)).toEqual([{ typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: null }])
    expect(ids(zustand, 1), 'A6: erst nach der Entscheidung wirkt sie').toEqual(ids(start, 1))
  })

  it('D9/A6: durchgelassen liegt sie in der Schlange des Mitspielers über seinen beiden Karten', () => {
    const start = tisch().schlange(1, ['Rot', 'Rot', 'Rot']).zustand()
    const [r1, r2, r3] = ids(start, 1)
    const ansage = fusionAuf(start, 1, 0)
    const { zustand, ereignisse } = folge(start, () => ansage, (jetzt) => reaktion(jetzt, false))
    expect(ids(zustand, 1)).toEqual([ansage.karteId, r3])
    expect(zustand.spieler[1].schlangen[0].fusionen.map((eintrag) => eintrag.unter.map((karte) => karte.id))).toEqual([[r1, r2]])
    expect(ereignisseVom(ereignisse, 'AnsageEntschieden')).toEqual([
      {
        typ: 'AnsageEntschieden',
        spielerIndex: 0,
        karteId: ansage.karteId,
        abgewehrt: [],
        ohneWirkung: false,
        nach: { ort: 'Schlange', spielerIndex: 1, schlangenId: 'schlange-1', position: 0 },
      },
    ])
    expect(ablage(zustand, 0)).toEqual([])
    expect(ermittleEntscheider(zustand), 'A6: danach entscheidet wieder der Spieler am Zug').toBe(0)
    expect(verletzteInvarianten(zustand)).toEqual([])
  })

  it('A7.2: abgewehrt bleibt die Schlange unverändert; die Fusion liegt auf dem Ablagestapel des Angreifers, der Farbenschutz auf dem des Verteidigers', () => {
    const start = tisch(2, MIT_SCHUTZ).schlange(1, ['Rot', 'Rot', 'Rot']).zustand()
    const ansage = fusionAuf(start, 1, 1)
    const schutz = start.spieler[1].hand[0].id
    const { zustand, ereignisse } = folge(start, () => ansage, (jetzt) => reaktion(jetzt, true))
    expect(ids(zustand, 1)).toEqual(ids(start, 1))
    expect(zustand.spieler[1].schlangen[0].fusionen).toEqual([])
    expect(ablage(zustand, 0)).toEqual([ansage.karteId])
    expect(ablage(zustand, 1)).toEqual([schutz])
    expect(ereignisseVom(ereignisse, 'AnsageEntschieden')[0]).toMatchObject({ abgewehrt: [1], ohneWirkung: true, nach: { ort: 'Ablagestapel', spielerIndex: 0 } })
    expect(zustand.spieler[1].hand, 'A6: wer abwehrt, zieht nicht gleich nach').toHaveLength(4)
  })

  it('A6: zu dritt ist nur der Besitzer der Zielschlange betroffen, nicht der andere Mitspieler', () => {
    const start = tisch(3, MIT_SCHUTZ).schlange(2, ['Braun', 'Braun']).zustand()
    const { zustand, ereignisse } = fuehreAus(start, fusionAuf(start, 2, 0))
    expect(ereignisseVom(ereignisse, 'KarteAngesagt')[0].betroffene).toEqual([2])
    expect(ermittleEntscheider(zustand)).toBe(2)
  })

  it('B2/A6: das Ziel steht mit der Ansage fest; solange sie schwebt, lehnt die Engine jede andere Fusion ab', () => {
    const start = tisch().schlange(0, ['Gelb', 'Gelb']).schlange(1, ['Rot', 'Rot']).zustand()
    const ansage = fusionAuf(start, 1, 0)
    const { zustand } = fuehreAus(start, ansage)
    expect(zustand.schwebend?.aktion).toEqual(ansage)
    expect(grund(zustand, { ...ansage, schlangenId: 'schlange-1', kartenIds: ids(start, 0) })).toMatch(/schwebt noch/)
  })

  it('A6: Speichern und Laden mitten in der Ansage setzt genau dort fort', () => {
    const start = tisch().schlange(1, ['Rot', 'Rot']).zustand()
    const { zustand } = fuehreAus(start, fusionAuf(start, 1, 0))
    const geladen = deserialisiere(serialisiere(zustand))
    expect(geladen).toEqual(zustand)
    const weiter = fuehreAus(geladen, reaktion(geladen, false)).zustand
    expect(arten(weiter, 1)).toEqual(['Farbenfusion'])
  })
})

describe('A7.7/D27: höchstens eine Farbenfusion je Zug (Kriterium 3)', () => {
  it('A7.7: nach einer Fusion bietet die Engine im selben Zug keine zweite an und lehnt sie ab', () => {
    const start = tischMitHaenden([['Farbenfusion', 'Farbenfusion', 'Blau'], FUENF]).schlange(0, ['Rot', 'Rot', 'Gelb', 'Gelb']).zustand()
    const { zustand } = fuehreAus(start, fusionAuf(start, 0, 0))
    expect(zustand.zug.farbenfusionGespielt).toBe(true)
    expect(fusionen(zustand)).toEqual([])
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', ids(start, 0).slice(2)))).toMatch(/schon eine Sonderkarte/)
  })

  it('A7.7: die Karte selbst lässt keine zweite Fusion im Zug zu, unabhängig von der Grenze je Sonderkarte', () => {
    const zustand = tisch()
      .schlange(0, ['Gelb', 'Gelb'])
      .aendere((z) => {
        z.zug.farbenfusionGespielt = true
      })
      .zustand()
    expect(fusionen(zustand)).toEqual([])
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', ids(zustand, 0)))).toMatch(/Pro Zug nur eine Farbenfusion.*A7\.7/)
  })

  it('D27: im zweiten Zug nach einem Verdoppler ist wieder eine Farbenfusion erlaubt, danach keine weitere', () => {
    const start = tischMitHaenden([['Verdoppler', 'Farbenfusion', 'Blau', 'Farbenfusion'], FUENF]).schlange(0, ['Gelb', 'Gelb', 'Rot', 'Rot']).zustand()
    const verdoppler = aktionen(start, 'VerdopplerSpielen')[0]
    const ersterZug = folge(start, () => verdoppler, farbkarte, zugBeenden).zustand
    expect(ersterZug.zug).toMatchObject({ teilzug: 2, farbenfusionGespielt: false })
    const nachFusion = fuehreAus(ersterZug, fusionAuf(ersterZug, 0, 0)).zustand
    expect(arten(nachFusion, 0).slice(0, 1)).toEqual(['Farbenfusion'])
    expect(fusionen(nachFusion), 'A7.7: in diesem Zug keine zweite').toEqual([])
  })
})

describe('E7 Grenzfälle', () => {
  it('A7.7: zwei Fusionen in einer Schlange und Fusion neben Fusion', () => {
    const start = tisch().schlange(0, ['Rot', 'Rot', { fusion: ['Gelb', 'Gelb'] }]).zustand()
    const [, , alt] = ids(start, 0)
    const neu = fusionskarte(start)
    const { zustand } = fuehreAus(start, fusionAuf(start, 0, 0))
    expect(ids(zustand, 0)).toEqual([neu, alt])
    expect(zustand.spieler[0].schlangen[0].fusionen.map((eintrag) => eintrag.karteId).sort()).toEqual([alt, neu].sort())
    expect(verletzteInvarianten(zustand)).toEqual([])
  })

  it.each([
    ['Anfang', 0, ['Farbenfusion', 'Rot', 'Gelb', 'Gelb']],
    ['Ende', 3, ['Blau', 'Blau', 'Rot', 'Farbenfusion']],
  ] as const)('D9: eine Fusion am Schlangenende (%s)', (_ende, links, danach) => {
    const start = tisch().schlange(0, ['Blau', 'Blau', 'Rot', 'Gelb', 'Gelb']).zustand()
    const { zustand, ereignisse } = fuehreAus(start, fusionAuf(start, 0, links))
    expect(arten(zustand, 0)).toEqual(danach)
    expect(ereignisseVom(ereignisse, 'KarteGespielt')[0].nach).toEqual({ ort: 'Schlange', spielerIndex: 0, schlangenId: 'schlange-1', position: links })
  })

  it('A7.7: aus einer Schlange mit genau zwei Karten wird eine Schlange aus der Fusion allein; sie bleibt bestehen', () => {
    const start = tisch().schlange(1, ['Grün', 'Grün']).zustand()
    const { zustand } = folge(start, (jetzt) => fusionAuf(jetzt, 1, 0), (jetzt) => reaktion(jetzt, false))
    expect(arten(zustand, 1)).toEqual(['Farbenfusion'])
    expect(verletzteInvarianten(zustand)).toEqual([])
  })
})
