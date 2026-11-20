import { afterEach, describe, expect, it, vi } from 'vitest'
import { anwendeAktion, deserialisiere, ermittleAktionen, ermittleEntscheider, serialisiere } from '../index'
import type { KartenAktion, Sonderkartenname, Spielzustand } from '../index'
import { KARTENREGISTER } from '../karten/register'
import type { Kartenwahl } from '../testing/szenario'
import { legeAufEigenenAblagestapel } from '../zugablauf'
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
  hand,
  MIT_GRUBE,
  MIT_SCHUTZ,
  reaktion,
  tischMitHaenden as tisch,
  verletzteInvarianten as verletzt,
  zugBeenden,
} from './zugablauf_hilfen'

/*
E4, der allgemeine Reaktionsablauf (A6, A7.2, D10, D15, B2): Eine Sonderkarte
gegen Mitspieler wird angesagt und schwebt, die Betroffenen entscheiden im
Uhrzeigersinn, erst dann wirkt sie. Gezeigt wird das an der Schlangengrube, der
einzigen Karte mit Ziel beim Gegner, die schon umgesetzt ist; mehrere Betroffene
(wie bei Schlangenfrass, A6 Beispiel 2) und die übrigen Sonderkarten stellt ein
Spion auf dem Kartenregister nach. Was die Grube selbst bewirkt, prüft
`schlangengrube.test.ts`.
*/

afterEach(() => {
  vi.restoreAllMocks()
})

describe('E4 Kriterium 1, A6, B2: die Ansage', () => {
  it('A6/E4 Kriterium 1: eine Sonderkarte gegen einen Mitspieler mit Farbenschutz wird angesagt und schwebt; sie wirkt noch nicht', () => {
    const vorher = tisch([MIT_GRUBE, MIT_SCHUTZ]).zustand()
    const grube = vorher.spieler[0].hand[0]
    const ansage = grubeAuf(vorher, 1)
    const { zustand, ereignisse } = fuehreAus(vorher, ansage)
    expect(zustand.schwebend).toEqual({ karte: grube, aktion: ansage, ausstehend: [1], abgewehrt: [] })
    expect(hand(zustand, 0), 'A6: die angesagte Karte liegt nicht mehr auf der Hand').not.toContain(grube.id)
    expect(zustand.ausliegendeGruben, 'A6: die Wirkung tritt erst nach der Reaktion ein').toEqual([])
    expect(ereignisse).toEqual([{ typ: 'KarteAngesagt', spielerIndex: 0, karteId: grube.id, ansage, betroffene: [1] }])
    expect(verletzt(zustand)).toEqual([])
  })

  it('B2/A6 Beispiel 1: nach der Ansage lässt sich das Ziel nicht mehr ändern, auch nicht nach der Abwehr', () => {
    const start = tisch([['Schlangengrube', 'Schlangengrube', 'Blau', 'Rot', 'Gelb'], MIT_SCHUTZ, FUENF]).zustand()
    const angesagt = fuehreAus(start, grubeAuf(start, 1)).zustand
    expect(ermittleAktionen(angesagt).every((aktion) => aktion.typ === 'Reagieren' && aktion.spielerId === 'spieler-2')).toBe(true)
    const zweite = angesagt.spieler[0].hand.find((karte) => karte.typ === 'Sonderkarte')!.id
    const umlenken = { typ: 'SchlangengrubeSpielen', spielerId: 'spieler-1', karteId: zweite, zielSpielerId: 'spieler-3' }
    expect(grund(angesagt, umlenken)).toMatch(/schwebt noch.*\(A6\)/)
    const abgewehrt = fuehreAus(angesagt, reaktion(angesagt, true)).zustand
    expect(aktionen(abgewehrt, 'SchlangengrubeSpielen'), 'A6 Beispiel 1: kein neues Ziel für die abgewehrte Karte').toEqual([])
    expect(grund(abgewehrt, umlenken)).toMatch(/schon eine Sonderkarte.*\(A5, D12\)/)
  })
})

describe('A6/E4 Kriterium 1 bis 3: wer betroffen ist, wer gefragt wird, wann die Karte wirkt', () => {
  /** Vier Spieler, Spieler 3 ist am Zug und sagt eine Schlangengrube an; die Betroffenen liefert ein Spion (wie bei Schlangenfrass, A6 Beispiel 2). */
  function mehrereZiele(betroffene: number[], haende: Kartenwahl[][]) {
    vi.spyOn(KARTENREGISTER.Schlangengrube, 'betroffene').mockReturnValue(betroffene)
    const wirke = vi.spyOn(KARTENREGISTER.Schlangengrube, 'wirke').mockImplementation((zustand, aktion) => {
      legeAufEigenenAblagestapel(zustand, aktion.spielerId, aktion.karteId)
      return zustand
    })
    const zustand = tisch(haende).amZug(2).zustand()
    return { zustand, wirke, ansage: grubeAuf(zustand, 3) }
  }
  const ALLE_MIT_SCHUTZ = [MIT_SCHUTZ, MIT_SCHUTZ, MIT_GRUBE, MIT_SCHUTZ]

  it('E4 Kriterium 1/D15: betroffen sind die Besitzer der Ziele ohne den Angreifer, im Uhrzeigersinn ab ihm, jeder einmal', () => {
    const { zustand, ansage } = mehrereZiele([1, 0, 2, 3, 0], ALLE_MIT_SCHUTZ)
    const { zustand: nach, ereignisse } = fuehreAus(zustand, ansage)
    expect(ereignisse).toEqual([expect.objectContaining({ typ: 'KarteAngesagt', spielerIndex: 2, betroffene: [3, 0, 1] })])
    expect(nach.schwebend?.ausstehend).toEqual([3, 0, 1])
    expect(ermittleEntscheider(nach), 'A6 Beispiel 2: zuerst entscheidet der Nächste im Uhrzeigersinn').toBe(3)
  })

  it('A6 Timing/E4 Kriterium 2: die Wirkung tritt erst ein, wenn alle Betroffenen entschieden haben; wer abgewehrt hat, steht dabei', () => {
    const { zustand, wirke, ansage } = mehrereZiele([1, 3, 0], ALLE_MIT_SCHUTZ)
    let jetzt = fuehreAus(zustand, ansage).zustand
    const schritte = [true, false, true].map((abwehren) => {
      const schritt = fuehreAus(jetzt, reaktion(jetzt, abwehren))
      jetzt = schritt.zustand
      return { wirkungen: wirke.mock.calls.length, ereignisse: schritt.ereignisse.map((ereignis) => ereignis.typ) }
    })
    expect(schritte).toEqual([
      { wirkungen: 0, ereignisse: ['Abgewehrt'] },
      { wirkungen: 0, ereignisse: [] },
      { wirkungen: 1, ereignisse: ['Abgewehrt', 'AnsageEntschieden'] },
    ])
    expect(wirke.mock.calls[0][2], 'A7.2: für die Abwehrenden hat die Karte keine Wirkung').toEqual([3, 1])
    expect(jetzt.schwebend).toBeNull()
    expect(ermittleEntscheider(jetzt), 'A6: danach entscheidet wieder der Spieler am Zug').toBe(2)
  })

  it('E4 Kriterium 3: gefragt wird nur, wer einen Farbenschutz hält', () => {
    const { zustand, wirke, ansage } = mehrereZiele([3, 0, 1], [FUENF, MIT_SCHUTZ, MIT_GRUBE, FUENF])
    const angesagt = fuehreAus(zustand, ansage).zustand
    expect(angesagt.schwebend?.ausstehend).toEqual([1])
    expect(ermittleEntscheider(angesagt)).toBe(1)
    const { zustand: nach } = fuehreAus(angesagt, reaktion(angesagt, false))
    expect(wirke).toHaveBeenCalledOnce()
    expect(nach.schwebend).toBeNull()
  })

  it('E4 Kriterium 3: hält kein Betroffener Farbenschutz, wirkt die Karte noch in derselben Aktion', () => {
    const { zustand, wirke, ansage } = mehrereZiele([3, 0, 1], [FUENF, FUENF, MIT_GRUBE, FUENF])
    const { zustand: nach, ereignisse } = fuehreAus(zustand, ansage)
    expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KarteAngesagt', 'AnsageEntschieden'])
    expect(wirke.mock.calls.map((aufruf) => aufruf[2])).toEqual([[]])
    expect(nach.schwebend).toBeNull()
    expect(ermittleEntscheider(nach)).toBe(2)
  })

  it('A7.2/E4 Kriterium 4: wehren alle ab, wirkt die Karte nicht und liegt auf dem Ablagestapel des Angreifers', () => {
    const { zustand, wirke, ansage } = mehrereZiele([3, 1], ALLE_MIT_SCHUTZ)
    const grube = zustand.spieler[2].hand[0].id
    const nach = folge(zustand, () => ansage, (jetzt) => reaktion(jetzt, true), (jetzt) => reaktion(jetzt, true))
    expect(wirke).not.toHaveBeenCalled()
    expect(ablage(nach.zustand, 2)).toEqual([grube])
    expect(ereignisseVom(nach.ereignisse, 'AnsageEntschieden')).toEqual([
      { typ: 'AnsageEntschieden', spielerIndex: 2, karteId: grube, abgewehrt: [3, 1], ohneWirkung: true, nach: { ort: 'Ablagestapel', spielerIndex: 2 } },
    ])
  })
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
    expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KarteAngesagt', 'Abgewehrt', 'AnsageEntschieden'])
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

describe('A6/E4 Kriterium 6: die Engine nennt jederzeit, wer entscheidet', () => {
  it('E4 Kriterium 6: vor der Ansage der Angreifer, dann jeder Gefragte, danach wieder der Angreifer; aufgezählt wird nur für ihn', () => {
    vi.spyOn(KARTENREGISTER.Schlangengrube, 'betroffene').mockReturnValue([1, 2])
    let zustand = tisch([MIT_GRUBE, MIT_SCHUTZ, MIT_SCHUTZ]).zustand()
    const entscheider: number[] = []
    const merke = () => {
      const index = ermittleEntscheider(zustand)!
      entscheider.push(index)
      expect(ermittleAktionen(zustand).every((aktion) => aktion.spielerId === zustand.spieler[index].id)).toBe(true)
    }
    merke()
    for (const waehle of [() => grubeAuf(zustand, 1), () => reaktion(zustand, false), () => reaktion(zustand, false)]) {
      zustand = fuehreAus(zustand, waehle()).zustand
      merke()
    }
    expect(entscheider).toEqual([0, 1, 2, 0])
  })
})

describe('A5, A6: Nachziehen nach einer Abwehr', () => {
  it('A6 Beispiel 1 Schritt 4: wer ausserhalb seines Zuges abwehrt, zieht nicht nach, sondern füllt zu Beginn seines nächsten Zuges auf', () => {
    const start = tisch([MIT_GRUBE, MIT_SCHUTZ]).zustand()
    const abwehr = folge(start, (jetzt) => grubeAuf(jetzt, 1), (jetzt) => reaktion(jetzt, true))
    expect(hand(abwehr.zustand, 1)).toHaveLength(4)
    expect(ereignisseVom(abwehr.ereignisse, 'KartenGezogen')).toEqual([])
    const weiter = folge(abwehr.zustand, farbkarte, zugBeenden)
    expect(ereignisseVom(weiter.ereignisse, 'KartenGezogen')).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 2 },
      { typ: 'KartenGezogen', spielerIndex: 1, anzahl: 1 },
    ])
    expect(hand(weiter.zustand, 1)).toHaveLength(5)
  })

  it('A6: wer in einer Runde zweimal angegriffen wird, kann nicht mit einem eben nachgezogenen Farbenschutz ein zweites Mal abwehren', () => {
    const start = tisch([MIT_GRUBE, MIT_GRUBE, MIT_SCHUTZ]).stapelOben(['Farbenschutz', 'Farbenschutz', 'Farbenschutz']).zustand()
    const erster = folge(start, (jetzt) => grubeAuf(jetzt, 2), (jetzt) => reaktion(jetzt, true), farbkarte, zugBeenden)
    expect(hand(erster.zustand, 2), 'A6: der Verteidiger hat nicht nachgezogen').toHaveLength(4)
    const zweiter = fuehreAus(erster.zustand, grubeAuf(erster.zustand, 2))
    expect(zweiter.zustand.schwebend, 'A6: ohne Farbenschutz wird er nicht gefragt').toBeNull()
    expect(zweiter.zustand.ausliegendeGruben.map((grube) => grube.vor)).toEqual([2])
  })

  it('E4 Grenzfall: ein Verteidiger mit zwei Farbenschutz verbraucht einen und kann den zweiten Angriff derselben Runde abwehren', () => {
    const start = tisch([MIT_GRUBE, MIT_GRUBE, ['Farbenschutz', 'Farbenschutz', 'Blau', 'Rot', 'Gelb']]).zustand()
    const erster = folge(start, (jetzt) => grubeAuf(jetzt, 2), (jetzt) => reaktion(jetzt, true), farbkarte, zugBeenden)
    expect(hand(erster.zustand, 2).filter((id) => id.startsWith('farbenschutz'))).toHaveLength(1)
    const zweiter = folge(erster.zustand, (jetzt) => grubeAuf(jetzt, 2), (jetzt) => reaktion(jetzt, true))
    expect(zweiter.zustand.ausliegendeGruben).toEqual([])
    expect(ablage(zweiter.zustand, 2).filter((id) => id.startsWith('farbenschutz'))).toHaveLength(2)
  })

  it('E4 Grenzfall: Abwehr mit der letzten Handkarte; zu Beginn des nächsten Zuges füllt er auf 5 auf', () => {
    const start = tisch([MIT_GRUBE, ['Farbenschutz']]).zustand()
    const abwehr = folge(start, (jetzt) => grubeAuf(jetzt, 1), (jetzt) => reaktion(jetzt, true))
    expect(hand(abwehr.zustand, 1)).toEqual([])
    const weiter = folge(abwehr.zustand, farbkarte, zugBeenden)
    expect(weiter.zustand.zug.spielerIndex).toBe(1)
    expect(hand(weiter.zustand, 1)).toHaveLength(5)
  })
})

describe('A6/E4 Kriterium 8: Speichern und Laden mitten in einer offenen Frage', () => {
  it('E4 Kriterium 8: nach dem Laden steht dieselbe Frage offen, und dieselbe Antwort führt zum selben Zustand', () => {
    vi.spyOn(KARTENREGISTER.Schlangengrube, 'betroffene').mockReturnValue([1, 2])
    const start = tisch([MIT_GRUBE, MIT_SCHUTZ, MIT_SCHUTZ]).zustand()
    const offen = folge(start, (jetzt) => grubeAuf(jetzt, 1), (jetzt) => reaktion(jetzt, true)).zustand
    const geladen = deserialisiere(serialisiere(offen))
    expect(geladen).toEqual(offen)
    expect(geladen.schwebend?.ausstehend).toEqual([2])
    expect(ermittleEntscheider(geladen)).toBe(2)
    expect(ermittleAktionen(geladen)).toEqual(ermittleAktionen(offen))
    const antwort = reaktion(offen, false)
    expect(anwendeAktion(geladen, antwort)).toEqual(anwendeAktion(offen, antwort))
  })
})

describe('B2: wer Farbenschutz hält, verraten die Ereignisse erst, wenn er ihn spielt', () => {
  it('B2: lässt ein Betroffener mit Farbenschutz durch, melden die Ereignisse dasselbe wie ohne Farbenschutz', () => {
    const mitSchutz = tisch([MIT_GRUBE, MIT_SCHUTZ]).zustand()
    const ohneSchutz = tisch([MIT_GRUBE, ['Violett', 'Blau', 'Rot', 'Gelb', 'Grün']]).zustand()
    const durchgelassen = folge(mitSchutz, (jetzt) => grubeAuf(jetzt, 1), (jetzt) => reaktion(jetzt, false)).ereignisse
    const ohneFrage = fuehreAus(ohneSchutz, grubeAuf(ohneSchutz, 1)).ereignisse
    expect(durchgelassen).toEqual(ohneFrage)
    expect(ohneFrage.map((ereignis) => ereignis.typ)).toEqual(['KarteAngesagt', 'AnsageEntschieden'])
  })
})
