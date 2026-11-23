import { describe, expect, it } from 'vitest'
import { deserialisiere, erstellePartie, erzeugeZufall, serialisiere } from '../../index'
import type { Spielzustand } from '../../index'
import { baukasten } from '../../testing/szenario'
import { meldeZugerweiterung } from '../../zuggrenzen'
import { beende, comebackAktion, einsetzen, FUENF, karteVon, mitBedingung, mitWirkung, schlangeAus, spiele, zugbeginn, zwei } from '../comeback_hilfen'
import { pruefeSchritt } from '../rahmen_hilfen'
import { aktionen, fuehreAus, grund, typen } from '../zugablauf_hilfen'

/*
X4, A8.1: die Comeback-Karte. Kriterien 1 bis 3 und 6 aus dem Plan: Jeder
Spieler hat zu Spielbeginn eine, nur mit Erweiterung (A4). Die Bedingung, die
längste eigene Schlange liege mindestens 5 Karten hinter der längsten auf dem
Tisch, stellt die Engine zu Beginn des eigenen Zuges fest, und sie gilt den
ganzen Zug (D48). Jede Karte zählt eins, eine Farbenfusion samt ihren zwei
Karten auch; ohne Schlange ist die Länge 0. Eingesetzt wird sie irgendwann im
Zug, nie im zweiten Zug nach einem Verdoppler (D47, D48); danach ist sie
umgedreht und nie wieder aktivierbar. Die Zusatzaktionen prüft
`A8.1_comeback_zusatzaktionen.test.ts`.
*/

const einsetzbar = (zustand: Spielzustand) => comebackAktion(zustand) !== undefined
const einsatz = (zustand: Spielzustand, spieler = 0) => ({
  typ: 'ComebackEinsetzen',
  spielerId: zustand.spieler[spieler].id,
  comebackId: zustand.spieler[spieler].comeback?.karte.id ?? `comeback-0${spieler + 1}`,
})

describe('A8.1/A4: jeder Spieler hat zu Spielbeginn eine Comeback-Karte, nur mit Erweiterung', () => {
  it.each([2, 3, 4])('A8.1/A4: mit Erweiterung liegt vor jedem der %i Spieler eine offene, unverbrauchte Comeback-Karte; ohne Erweiterung keine', (spielerzahl) => {
    const mit = erstellePartie({ spielerzahl, erweiterung: true, zufall: erzeugeZufall(spielerzahl) })
    const ohne = erstellePartie({ spielerzahl, erweiterung: false, zufall: erzeugeZufall(spielerzahl) })
    expect(mit.spieler.map((spieler) => spieler.comeback), 'erstellePartie: mit Erweiterung').toEqual(
      mit.spieler.map((_, index) => ({ karte: { typ: 'Comeback', id: `comeback-0${index + 1}` }, verbraucht: false })),
    )
    expect(ohne.spieler.map((spieler) => spieler.comeback), 'erstellePartie: ohne Erweiterung').toEqual(ohne.spieler.map(() => null))
    expect(mit.zug.comebackBedingung, 'A8.1: zu Spielbeginn hat niemand eine Schlange, also keinen Rückstand').toBe(false)
  })

  it('A8.1/A4: ohne Erweiterung gibt es keine Comeback-Aktion, auch nicht bei einem Rückstand von 6 Karten', () => {
    const zustand = zugbeginn(baukasten({ spielerzahl: 2, erweiterung: false }).hand(0, FUENF).hand(1, FUENF).schlange(1, schlangeAus(6)))
    expect(zustand.zug.comebackBedingung, 'D48: ohne Erweiterung stellt die Engine keine Bedingung fest').toBe(false)
    expect(typen(zustand)).not.toContain('ComebackEinsetzen')
    expect(grund(zustand, einsatz(zustand))).toMatch(/ohne Erweiterung.*A4/)
  })
})

describe('A8.1/D48: Die Bedingung wird zu Beginn des eigenen Zuges festgestellt', () => {
  it('A8.1: Rückstand 5 zu Zugbeginn (1 gegen 6 Karten): die Comeback-Karte ist einsetzbar', () => {
    const zustand = zugbeginn(zwei(FUENF, 1, 6))
    expect(zustand.zug.comebackBedingung).toBe(true)
    expect(comebackAktion(zustand)).toEqual({ typ: 'ComebackEinsetzen', spielerId: 'spieler-1', comebackId: 'comeback-01' })
  })

  it('A8.1: Rückstand 4 zu Zugbeginn (1 gegen 5 Karten): nicht einsetzbar, die Engine nennt den Grund', () => {
    const zustand = zugbeginn(zwei(FUENF, 1, 5))
    expect(zustand.zug.comebackBedingung).toBe(false)
    expect(einsetzbar(zustand)).toBe(false)
    expect(grund(zustand, einsatz(zustand))).toMatch(/mindestens 5 Karten.*\(A8\.1, D48\)/)
  })

  it('D48: ohne eigene Schlange ist die Länge 0; gegen 5 Karten ist die Bedingung erfüllt, gegen 4 nicht', () => {
    expect(zugbeginn(zwei(FUENF, 0, 5)).zug.comebackBedingung, 'D48: 0 gegen 5').toBe(true)
    expect(zugbeginn(zwei(FUENF, 0, 4)).zug.comebackBedingung, 'D48: 0 gegen 4').toBe(false)
  })

  it('D48: jede Karte der Schlange zählt eins, auch Sonderkarten', () => {
    const mitSonderkarten = (glieder: Parameters<ReturnType<typeof baukasten>['schlange']>[1]) =>
      zugbeginn(baukasten({ spielerzahl: 2, erweiterung: true }).hand(0, FUENF).hand(1, FUENF).schlange(1, glieder)).zug.comebackBedingung
    expect(mitSonderkarten(['Rot', 'Schlangenblockade', 'Rot', 'Regenbogenschlange', 'Rot']), 'D48: drei Farbkarten und zwei Sonderkarten sind 5').toBe(true)
    expect(mitSonderkarten(['Rot', 'Schlangenblockade', 'Rot', 'Regenbogenschlange']), 'D48: zwei Farbkarten und zwei Sonderkarten sind 4').toBe(false)
  })

  it('D48: eine Farbenfusion samt ihren zwei Karten zählt eins', () => {
    const mitFusion = (vorne: number) =>
      zugbeginn(baukasten({ spielerzahl: 2, erweiterung: true }).hand(0, FUENF).hand(1, FUENF).schlange(1, [...schlangeAus(vorne), { fusion: ['Gelb', 'Gelb'] }])).zug
        .comebackBedingung
    expect(mitFusion(4), 'D48: vier Karten und eine Fusion sind 5').toBe(true)
    expect(mitFusion(3), 'D48: drei Karten und eine Fusion sind 4, nicht 6').toBe(false)
  })

  it('A8.1: gemessen wird die längste eigene Schlange gegen die längste auf dem Tisch, gleich wessen', () => {
    const drei = (eigene: [number, number], fremde: [number, number]) =>
      zugbeginn(
        baukasten({ spielerzahl: 3, erweiterung: true })
          .hand(0, FUENF)
          .hand(1, FUENF)
          .hand(2, FUENF)
          .schlange(0, schlangeAus(eigene[0]))
          .schlange(0, schlangeAus(eigene[1]))
          .schlange(1, schlangeAus(fremde[0]))
          .schlange(2, schlangeAus(fremde[1])),
      ).zug.comebackBedingung
    expect(drei([1, 2], [3, 7]), 'A8.1: längste eigene 2, längste am Tisch 7').toBe(true)
    expect(drei([1, 3], [7, 2]), 'A8.1: längste eigene 3, längste am Tisch 7').toBe(false)
    expect(drei([6, 1], [7, 3]), 'A8.1: die längste eigene zählt, nicht die kürzere').toBe(false)
  })

  it('A8.1/D48: die Bedingung gilt den ganzen Zug: verkürzt Spieler 1 den Rückstand im Zug auf 4, bleibt sie einsetzbar', () => {
    const start = zugbeginn(zwei(FUENF, 1, 6))
    const eigeneSchlange = start.spieler[0].schlangen[0].id
    const angelegt = aktionen(start, 'FarbkarteLegen').find((aktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'schlange' && aktion.ziel.schlangenId === eigeneSchlange)
    if (angelegt === undefined || angelegt.typ !== 'FarbkarteLegen') throw new Error('Testaufbau: Anlegen an die eigene Schlange fehlt.')
    const nach = pruefeSchritt(start, fuehreAus(start, angelegt)).zustand
    expect(nach.spieler[0].schlangen[0].karten, 'Testaufbau: 2 gegen 6, Rückstand jetzt 4').toHaveLength(2)
    expect(nach.zug.comebackBedingung, 'D48: festgestellt zu Zugbeginn').toBe(true)
    expect(einsetzbar(nach)).toBe(true)
  })

  it('A8.1/D48: wächst der Rückstand erst im Zug auf 5, bleibt sie unerfüllt', () => {
    const start = zugbeginn(zwei(FUENF, 1, 5))
    const fremdeSchlange = start.spieler[1].schlangen[0].id
    const angelegt = aktionen(start, 'FarbkarteLegen').find((aktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'schlange' && aktion.ziel.schlangenId === fremdeSchlange)
    if (angelegt === undefined || angelegt.typ !== 'FarbkarteLegen') throw new Error('Testaufbau: Anlegen an die fremde Schlange fehlt (D9).')
    const nach = pruefeSchritt(start, fuehreAus(start, angelegt)).zustand
    expect(nach.spieler[1].schlangen[0].karten, 'Testaufbau: die fremde Schlange hat jetzt 6 Karten').toHaveLength(6)
    expect(nach.zug.comebackBedingung).toBe(false)
    expect(einsetzbar(nach)).toBe(false)
  })

  it('A8.1: zu Beginn jedes eigenen Zuges stellt die Engine die Bedingung neu fest, für jeden Spieler selbst', () => {
    const start = zugbeginn(zwei(FUENF, 1, 6))
    expect(start.zug.comebackBedingung, 'Spieler 1 liegt 5 zurück').toBe(true)
    const gegner = beende(spiele(start, karteVon(start, 'Blau')).zustand).zustand
    expect(gegner.zug).toMatchObject({ spielerIndex: 1, comebackBedingung: false })
    const wieder = beende(spiele(gegner, gegner.spieler[1].hand[0].id).zustand).zustand
    expect(wieder.zug.spielerIndex).toBe(0)
    const rueckstand = Math.max(...wieder.spieler[1].schlangen.map((s) => s.karten.length)) - Math.max(0, ...wieder.spieler[0].schlangen.map((s) => s.karten.length))
    expect(wieder.zug.comebackBedingung, `A8.1: neu festgestellt bei Rückstand ${rueckstand}`).toBe(rueckstand >= 5)
  })
})

describe('A8.1/D47/D48: einsetzbar irgendwann im eigenen Zug, nie im zweiten Zug nach einem Verdoppler', () => {
  it('D48: vor der ersten Karte, nach einer Karte und nach beiden Karten des Zuges', () => {
    const start = mitBedingung(zwei(['Blau', 'Rot', 'Schlangenblockade', 'Gelb'], 1, 6))
    expect(einsetzbar(start), 'vor der ersten Karte').toBe(true)
    const eine = spiele(start, karteVon(start, 'Blau')).zustand
    expect(einsetzbar(eine), 'nach einer Farbkarte').toBe(true)
    const beide = spiele(eine, karteVon(eine, 'Schlangenblockade')).zustand
    expect(typen(beide), 'Testaufbau: ohne Comeback bliebe nur das Beenden').toEqual(['ComebackEinsetzen', 'ZugBeenden'])
    const eingesetzt = einsetzen(beide).zustand
    expect(mitWirkung(eingesetzt, karteVon(eingesetzt, 'Rot')), 'A8.1: nach dem Einsatz geht noch eine Karte').toBe(true)
  })

  it('A8.1: der Einsatz zählt nicht als reguläre Aktion: danach gehen eine Farbkarte und eine Sonderkarte wie sonst, und ohne Karte lässt sich der Zug nicht beenden', () => {
    const eingesetzt = einsetzen(mitBedingung(zwei(['Blau', 'Schlangenblockade'], 1, 6))).zustand
    expect(eingesetzt.zug).toMatchObject({ gespielteFarbkarten: 0, gespielteSonderkarten: 0 })
    expect(typen(eingesetzt), 'A5: mindestens eine Karte').not.toContain('ZugBeenden')
    expect(grund(eingesetzt, { typ: 'ZugBeenden', spielerId: 'spieler-1' })).toMatch(/mindestens eine Karte/)
    const gespielt = spiele(spiele(eingesetzt, karteVon(eingesetzt, 'Blau')).zustand, karteVon(eingesetzt, 'Schlangenblockade')).zustand
    expect(gespielt.zug).toMatchObject({ gespielteFarbkarten: 1, gespielteSonderkarten: 1 })
  })

  it('A8.1: nur im eigenen Zug: der Gegner kann seine Comeback-Karte im Zug von Spieler 1 nicht einsetzen', () => {
    const zustand = mitBedingung(zwei(FUENF, 6, 1))
    expect(grund(zustand, einsatz(zustand, 1))).toMatch(/nicht am Zug/)
  })

  it('D47: hat Spieler 1 in diesem Zug schon einen Verdoppler gespielt, geht die Comeback-Karte nicht', () => {
    const start = mitBedingung(zwei(['Verdoppler', 'Blau', 'Rot'], 1, 6))
    const verdoppelt = spiele(start, karteVon(start, 'Verdoppler')).zustand
    expect(einsetzbar(verdoppelt)).toBe(false)
    expect(grund(verdoppelt, einsatz(verdoppelt))).toMatch(/Verdoppler.*D47/)
  })

  it('D48 (Rückfrage vom 23.11.2026): im zweiten Zug nach einem Verdoppler ist sie nie einsetzbar, auch wenn die Bedingung galt', () => {
    const start = zugbeginn(zwei(['Verdoppler', 'Blau', 'Rot', 'Gelb', 'Grün'], 1, 6))
    expect(start.zug.comebackBedingung).toBe(true)
    const zweiter = beende(spiele(start, karteVon(start, 'Verdoppler')).zustand).zustand
    expect(zweiter.zug).toMatchObject({ spielerIndex: 0, teilzug: 2 })
    expect(einsetzbar(zweiter)).toBe(false)
    expect(grund(zweiter, einsatz(zweiter))).toMatch(/D47/)
  })

  it('A7.8/D47: nach der Comeback-Karte wirkt kein Verdoppler; er lässt sich nur wirkungslos ablegen', () => {
    const eingesetzt = einsetzen(mitBedingung(zwei(['Verdoppler', 'Blau'], 1, 6))).zustand
    const verdoppler = karteVon(eingesetzt, 'Verdoppler')
    expect(mitWirkung(eingesetzt, verdoppler)).toBe(false)
    expect(aktionen(eingesetzt, 'SonderkarteWirkungslosAblegen').map((aktion) => 'karteId' in aktion && aktion.karteId)).toEqual([verdoppler])
  })

  it('D47: neben einem zugerweiternden Bonus des Schlangenkorbs geht die Comeback-Karte nicht', () => {
    const zustand = mitBedingung(zwei(FUENF, 1, 6).aendere((jetzt) => meldeZugerweiterung(jetzt.zug, 'Schlangenkorb', [])))
    expect(einsetzbar(zustand)).toBe(false)
    expect(grund(zustand, einsatz(zustand))).toMatch(/Schlangenkorbs.*D47/)
  })

  it('A8.1: in der Schlussrunde ist sie im letzten eigenen Zug einsetzbar', () => {
    const zustand = mitBedingung(zwei(FUENF, 1, 6).schlussrunde(1).amZug(0))
    expect(einsetzbar(zustand)).toBe(true)
  })
})

describe('A8.1: Nach der Nutzung ist sie umgedreht und nie wieder aktivierbar', () => {
  it('A8.1: nach dem Einsatz ist sie verbraucht; das Ereignis nennt sie, und der Zug hat zwei Zusatzaktionen aus drei Möglichkeiten', () => {
    const start = mitBedingung(zwei(FUENF, 1, 6))
    const schritt = einsetzen(start)
    expect(schritt.ereignisse).toEqual([{ typ: 'ComebackEingesetzt', spielerIndex: 0, karteId: 'comeback-01' }])
    expect(schritt.zustand.spieler[0].comeback).toEqual({ karte: { typ: 'Comeback', id: 'comeback-01' }, verbraucht: true })
    const zusatz = { quelle: 'Comeback', erlaubt: ['Farbkarte', 'Sonderkarte', 'Zwei Karten abwerfen, drei ziehen'], nurKarten: null }
    expect(schritt.zustand.zug).toMatchObject({ zusatzaktionen: [zusatz, zusatz], runde: ['Comeback'] })
    expect(schritt.zustand.spieler[1].comeback?.verbraucht, 'die Karte des Gegners bleibt').toBe(false)
  })

  it('A8.1: ein zweites Mal im selben Zug geht nicht', () => {
    const eingesetzt = einsetzen(mitBedingung(zwei(FUENF, 1, 6))).zustand
    expect(einsetzbar(eingesetzt)).toBe(false)
    expect(grund(eingesetzt, einsatz(eingesetzt))).toMatch(/umgedreht.*A8\.1/)
  })

  it('A8.1: gilt die Bedingung in einem späteren Zug wieder, bleibt sie verbraucht', () => {
    const eingesetzt = einsetzen(zugbeginn(zwei(FUENF, 1, 7))).zustand
    const gegner = beende(spiele(eingesetzt, karteVon(eingesetzt, 'Blau')).zustand).zustand
    const fremd = gegner.spieler[1].schlangen[0].id
    const anlegen = aktionen(gegner, 'FarbkarteLegen').find((aktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'schlange' && aktion.ziel.schlangenId === fremd)
    if (anlegen === undefined || anlegen.typ !== 'FarbkarteLegen') throw new Error('Testaufbau: Der Gegner kann seine Schlange nicht verlängern.')
    const wieder = beende(pruefeSchritt(gegner, fuehreAus(gegner, anlegen)).zustand).zustand
    expect(wieder.zug).toMatchObject({ spielerIndex: 0, comebackBedingung: true })
    expect(einsetzbar(wieder)).toBe(false)
    expect(grund(wieder, einsatz(wieder))).toMatch(/umgedreht/)
  })

  it('A8.1: mehrere Spieler setzen in ihren Zügen je ihre eigene ein', () => {
    const start = zugbeginn(
      baukasten({ spielerzahl: 3, erweiterung: true }).hand(0, FUENF).hand(1, FUENF).hand(2, FUENF).schlange(0, schlangeAus(1)).schlange(1, schlangeAus(1)).schlange(2, schlangeAus(8)),
    )
    const erster = einsetzen(start).zustand
    const zweiter = beende(spiele(erster, karteVon(erster, 'Blau')).zustand).zustand
    expect(zweiter.zug).toMatchObject({ spielerIndex: 1, comebackBedingung: true })
    const schritt = einsetzen(zweiter)
    expect(schritt.ereignisse).toEqual([{ typ: 'ComebackEingesetzt', spielerIndex: 1, karteId: 'comeback-02' }])
    expect(schritt.zustand.spieler.map((spieler) => spieler.comeback?.verbraucht)).toEqual([true, true, false])
  })

  it('A8.1: nur die eigene Comeback-Karte: eine fremde oder erfundene Id lehnt die Engine ab', () => {
    const zustand = mitBedingung(zwei(FUENF, 1, 6))
    expect(grund(zustand, { ...einsatz(zustand), comebackId: 'comeback-02' })).toMatch(/comeback-02.*nicht die Comeback-Karte von Spieler 1/)
    expect(grund(zustand, { ...einsatz(zustand), comebackId: 'blau-01' })).toMatch(/blau-01/)
  })

  it('A8.1/X3: Speichern und Laden mitten im Comeback-Zug: Bedingung, Verbrauch und Zusatzaktionen bleiben', () => {
    const eingesetzt = einsetzen(mitBedingung(zwei(FUENF, 1, 6))).zustand
    expect(deserialisiere(serialisiere(eingesetzt))).toEqual(eingesetzt)
    const kaputt = JSON.parse(serialisiere(eingesetzt))
    kaputt.zug.comebackBedingung = 'ja'
    expect(() => deserialisiere(JSON.stringify(kaputt)), 'deserialisiere: comebackBedingung muss ein Wahrheitswert sein').toThrow(/zug\.comebackBedingung/)
  })
})
