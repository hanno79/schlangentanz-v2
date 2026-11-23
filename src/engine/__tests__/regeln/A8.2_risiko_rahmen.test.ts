import { describe, expect, it } from 'vitest'
import { deserialisiere, ermittleAktionen, ermittleEntscheider, erstellePartie, erzeugeZufall, pruefeAktion, serialisiere } from '../../index'
import type { SpielAktion, Spielzustand } from '../../index'
import { zugerweiterungGesperrt } from '../../zuggrenzen'
import { aktionen, ereignisseVom, farbkarte, folge, fuehreAus, grund, hand, spieleZug, zugBeenden } from '../zugablauf_hilfen'
import { idVon, risikoAktionen, risikoTisch, schlangenkarte, spieleRisiko, waehle } from '../risiko_hilfen'

/*
X5, Kriterien 1, 2, 3 und 6: der Rahmen der Risiko-Belohnungs-Karten (A8.2).
Jeder Spieler hat mit Erweiterung zwei; eine gespielte kommt aus dem Spiel und
liegt nie auf einem Ablagestapel (D54). Höchstens eine je Runde, der zweite
Zug nach einem Verdoppler gehört zur selben Runde (D50); ihr Einsatz zählt
nicht als reguläre Aktion und ist keine Zugerweiterung (D47). Bei leerem
Stapel und in der Schlussrunde ist sie nicht spielbar; nimmt ein Gegner die
letzte Karte, löst der Spieler am Zug die Schlussrunde aus (D55).
*/

const tisch = () => risikoTisch({ hand: ['Blau', 'Rot', 'Verdoppler', 'Schlangenfrass'], schlange: ['Gelb', 'Gelb'], oben: ['Grün', 'Braun', 'Violett'] })

function risikoTypen(zustand: Spielzustand): number[] {
  return risikoAktionen(zustand).flatMap((aktion) => (aktion.typ === 'RisikoKarteSpielen' ? [aktion.risikoAktion] : []))
}

describe('A8.2: zwei Risiko-Karten je Spieler, nur mit Erweiterung (X5, Kriterium 1)', () => {
  it('A4/A8.2: ohne Erweiterung gibt es keine Risiko-Aktion; mit Erweiterung bietet die Engine alle vier an', () => {
    const ohne = erstellePartie({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(5) })
    expect(ohne.spieler.map((spieler) => spieler.risikoKarten)).toEqual([[], []])
    expect(risikoAktionen(ohne)).toEqual([])
    const mit = tisch()
    expect(mit.spieler[0].risikoKarten.map((karte) => karte.id)).toEqual(['risiko-belohnung-01', 'risiko-belohnung-02'])
    expect(new Set(risikoTypen(mit))).toEqual(new Set([1, 2, 3, 4]))
    expect(risikoAktionen(mit).every((aktion) => 'karteId' in aktion && aktion.karteId === 'risiko-belohnung-01'), 'je Aktion einmal, mit der ersten Karte').toBe(true)
  })

  it('A8.2/D54: nach dem Ausspielen ist die Karte aus dem Spiel und liegt auf keinem Ablagestapel; die zweite bleibt vor dem Spieler', () => {
    const schritt = spieleRisiko(tisch(), 1)
    expect(schritt.zustand.spieler[0].risikoKarten.map((karte) => karte.id)).toEqual(['risiko-belohnung-02'])
    expect(schritt.zustand.ausDemSpiel.map((karte) => karte.id)).toEqual(['risiko-belohnung-01'])
    expect(schritt.zustand.spieler.flatMap((spieler) => spieler.ablagestapel.map((karte) => karte.id))).not.toContain('risiko-belohnung-01')
  })

  it('A8.2: eine fremde oder schon gespielte Risiko-Karte lässt sich nicht spielen, mit deutschem Grund', () => {
    const start = tisch()
    const fremd: SpielAktion = { typ: 'RisikoKarteSpielen', spielerId: 'spieler-1', karteId: 'risiko-belohnung-03', risikoAktion: 1, benannt: null }
    expect(grund(start, fremd)).toMatch(/risiko-belohnung-03.*nicht in der eigenen Auslage/)
    expect(grund(start, { ...fremd, karteId: 'blau-01' })).toMatch(/nicht in der eigenen Auslage/)
  })
})

describe('A8.2/D50: höchstens eine Risiko-Karte je Runde (X5, Kriterium 2)', () => {
  it('D50: nach einer Risiko-Karte bietet die Engine in dieser Runde keine zweite an und lehnt sie ab', () => {
    const gespielt = spieleRisiko(tisch(), 1).zustand
    expect(risikoAktionen(gespielt)).toEqual([])
    const zweite: SpielAktion = { typ: 'RisikoKarteSpielen', spielerId: 'spieler-1', karteId: 'risiko-belohnung-02', risikoAktion: 1, benannt: null }
    expect(grund(gespielt, zweite)).toMatch(/D50/)
  })

  it('D50: der zweite Zug nach einem Verdoppler gehört zur selben Runde; ein Verdoppler gibt keine zweite Risiko-Karte', () => {
    const gespielt = spieleRisiko(tisch(), 1).zustand
    const verdoppler = aktionen(gespielt, 'VerdopplerSpielen')
    expect(verdoppler, 'D47: die Risiko-Karte ist keine Zugerweiterung, der Verdoppler wirkt').toHaveLength(1)
    // Nach den drei gezogenen Karten hält er 6 und wirft vor dem zweiten Zug eine ab (A5).
    const zweiterZug = folge(gespielt, () => verdoppler[0], zugBeenden, (jetzt) => aktionen(jetzt, 'UeberhandAbwerfen')[0]).zustand
    expect(zweiterZug.zug).toMatchObject({ spielerIndex: 0, teilzug: 2 })
    expect(risikoAktionen(zweiterZug)).toEqual([])
  })

  it('D50: ohne Risiko-Karte im ersten Zug ist sie im zweiten Zug nach einem Verdoppler noch spielbar', () => {
    const start = tisch()
    const zweiterZug = folge(start, (jetzt) => aktionen(jetzt, 'VerdopplerSpielen')[0], zugBeenden).zustand
    expect(zweiterZug.zug.teilzug).toBe(2)
    expect(risikoTypen(zweiterZug)).toContain(1)
  })

  it('D50: in der nächsten eigenen Runde ist die zweite Risiko-Karte wieder spielbar', () => {
    const gespielt = spieleRisiko(risikoTisch({ hand: ['Blau', 'Rot'], spielerzahl: 2, oben: ['Gelb', 'Grün', 'Braun'] }), 1).zustand
    const naechste = spieleZug(fuehreAus(fuehreAus(gespielt, farbkarte(gespielt)).zustand, zugBeenden(gespielt)).zustand).zustand
    expect(naechste.zug.spielerIndex).toBe(0)
    expect(risikoAktionen(naechste).every((aktion) => 'karteId' in aktion && aktion.karteId === 'risiko-belohnung-02')).toBe(true)
    expect(risikoAktionen(naechste).length).toBeGreaterThan(0)
  })
})

describe('A8.2: der Einsatz zählt nicht als reguläre Aktion (X5, Kriterium 2)', () => {
  it('A8.2: nach der Risiko-Karte darf der Spieler weiter eine Farbkarte und eine Sonderkarte spielen; „Zug beenden“ erst nach einer Karte (A5)', () => {
    const gespielt = spieleRisiko(tisch(), 1).zustand
    expect(gespielt.zug.verwendet, 'A8.2: kein Platz des Zuges ist belegt').toEqual([])
    expect(aktionen(gespielt, 'FarbkarteLegen').length).toBeGreaterThan(0)
    expect(aktionen(gespielt, 'SchlangenfrassSpielen').length).toBeGreaterThan(0)
    expect(aktionen(gespielt, 'ZugBeenden'), 'A5: mindestens eine Karte je Zug').toEqual([])
  })

  it('A8.2: auch nach beiden Karten des Zuges ist die Risiko-Karte noch spielbar', () => {
    const start = tisch()
    const eigeneKarte = (jetzt: Spielzustand) => aktionen(jetzt, 'SchlangenfrassSpielen').find((aktion) => aktion.typ === 'SchlangenfrassSpielen' && aktion.option === 'eigeneKarte')!
    const gespielt = folge(start, farbkarte, eigeneKarte).zustand
    expect(ermittleEntscheider(gespielt)).toBe(0)
    expect(new Set(risikoTypen(gespielt))).toEqual(new Set([1, 2, 3, 4]))
  })

  it('A8.2/D47: die Risiko-Karte meldet keine Zugerweiterung an', () => {
    const gespielt = spieleRisiko(tisch(), 1).zustand
    expect(zugerweiterungGesperrt(gespielt.zug)).toBeNull()
    expect(gespielt.zug.zusatzaktionen).toEqual([])
  })

  it('A8.2: die zusätzliche Farbkarte aus Aktion 2 belegt keinen Platz; die Farbkarte des Zuges bleibt frei', () => {
    const start = tisch()
    const schritt = spieleRisiko(start, 2, idVon(start, 0, 'Blau'))
    const eigene = start.spieler[0].schlangen[0].id
    const gelegt = waehle(schritt.zustand, `${idVon(start, 0, 'Rot')} ${eigene} ende`).zustand
    expect(gelegt.zug.verwendet).toEqual([])
    expect(aktionen(gelegt, 'FarbkarteLegen').length).toBeGreaterThan(0)
  })
})

describe('A8.2/D55: Prüfung über den Nachziehstapel und das Spielende (X5, Kriterien 3 und 6)', () => {
  it('D55: in der Schlussrunde ist keine Risiko-Karte spielbar', () => {
    const schluss = risikoTisch({ hand: ['Blau', 'Rot'], weiter: (bau) => bau.schlussrunde(1) })
    expect(risikoAktionen(schluss)).toEqual([])
    expect(grund(schluss, { typ: 'RisikoKarteSpielen', spielerId: 'spieler-1', karteId: 'risiko-belohnung-01', risikoAktion: 1, benannt: null })).toMatch(/D55/)
  })

  it('D55: deckt die Prüfung die letzte Karte auf, beginnt die Schlussrunde; Auslöser ist der Spieler am Zug, er spielt weiter', () => {
    const start = risikoTisch({ hand: ['Blau', 'Rot'], oben: ['Gelb'], weiter: (bau) => bau.stapelBehalten(1) })
    const schritt = spieleRisiko(start, 1)
    expect(ereignisseVom(schritt.ereignisse, 'SchlussrundeBegonnen')).toEqual([{ typ: 'SchlussrundeBegonnen', ausloeser: 0 }])
    expect(hand(schritt.zustand, 0), 'D57: er zieht, was da ist, und darf es im selben Zug spielen').toHaveLength(3)
    expect(aktionen(schritt.zustand, 'FarbkarteLegen').length).toBeGreaterThan(0)
  })

  it('D55: nimmt der begünstigte Gegner die letzte Karte, löst trotzdem der Spieler am Zug die Schlussrunde aus', () => {
    const start = risikoTisch({ hand: ['Blau', 'Rot'], schlange: ['Gelb'], oben: ['Farbendieb', 'Violett'], weiter: (bau) => bau.stapelBehalten(2) })
    const gegner = waehle(spieleRisiko(start, 2, idVon(start, 0, 'Blau')).zustand, 'spieler-2').zustand
    const gezogen = waehle(gegner, 'stapel')
    expect(ereignisseVom(gezogen.ereignisse, 'SchlussrundeBegonnen')).toEqual([{ typ: 'SchlussrundeBegonnen', ausloeser: 0 }])
    expect(gezogen.zustand.zug.spielerIndex).toBe(0)
  })

  it('D52/D55: liegt nach dem Aufdecken keine Karte mehr im Stapel, bleibt dem Gegner bei Aktion 2 nur die geplante Farbkarte', () => {
    const start = risikoTisch({ hand: ['Blau', 'Rot'], schlange: ['Gelb'], oben: ['Farbendieb'], weiter: (bau) => bau.stapelBehalten(1) })
    const gegner = waehle(spieleRisiko(start, 2, idVon(start, 0, 'Blau')).zustand, 'spieler-3').zustand
    expect(ermittleAktionen(gegner).map((aktion) => (aktion.typ === 'Entscheiden' ? aktion.wahl : aktion.typ))).toEqual(['geplante'])
  })
})

describe('A8.2: wann und von wem eine Risiko-Karte gespielt wird', () => {
  it('A8.2: nur im eigenen Zug; ein Gegner bekommt keine Risiko-Aktion und wird abgelehnt', () => {
    const start = tisch()
    const gegner: SpielAktion = { typ: 'RisikoKarteSpielen', spielerId: 'spieler-2', karteId: 'risiko-belohnung-03', risikoAktion: 1, benannt: null }
    expect(pruefeAktion(start, gegner)).toMatchObject({ erlaubt: false, grund: expect.stringMatching(/nicht am Zug/) })
  })

  it('A8.2/X3: solange eine Entscheidung offen ist, geht keine Risiko-Karte; am Zugende beim Abwerfen auch nicht (A5)', () => {
    const offen = spieleRisiko(risikoTisch({ hand: ['Blau', 'Rot'], oben: ['Schlangenfrass'] }), 1).zustand
    expect(risikoAktionen(offen)).toEqual([])
    const abwerfen = risikoTisch({ hand: ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun', 'Violett', 'Blau'], weiter: (bau) => bau.gespielt(1, 0) })
    const ende = fuehreAus(abwerfen, zugBeenden(abwerfen)).zustand
    expect(ende.zug.abschnitt).toBe('Abwerfen')
    expect(risikoAktionen(ende)).toEqual([])
  })

  it('D52: ohne Farbkarte auf der Hand ist Aktion 2 nicht wählbar; Aktion 3 braucht eine Farbkarte in einer eigenen Schlange', () => {
    const ohneFarbe = risikoTisch({ hand: ['Verdoppler', 'Farbenschutz'], schlange: ['Gelb'] })
    expect(risikoTypen(ohneFarbe).sort()).toEqual([1, 3, 4])
    const ohneSchlange = risikoTisch({ hand: ['Blau'], schlange: ['Regenbogenschlange'] })
    expect(risikoTypen(ohneSchlange), 'A8.2 Aktion 3: nur eine Farbkarte der eigenen Schlange').not.toContain(3)
  })

  it('D52 (Annahme, U2): ohne eigene Schlange ist Aktion 2 nicht wählbar, weil die Farbkarte nur an eine eigene Schlange darf', () => {
    expect(risikoTypen(risikoTisch({ hand: ['Blau', 'Rot'] })).sort()).toEqual([1, 4])
  })

  it('A8.2: eine falsch benannte Karte lehnt die Engine mit Grund ab', () => {
    const start = tisch()
    const basis = { typ: 'RisikoKarteSpielen', spielerId: 'spieler-1', karteId: 'risiko-belohnung-01' } as const
    expect(grund(start, { ...basis, risikoAktion: 2, benannt: idVon(start, 0, 'Verdoppler') })).toMatch(/D52/)
    expect(grund(start, { ...basis, risikoAktion: 2, benannt: idVon(start, 1, 'Blau') })).toMatch(/D52/)
    expect(grund(start, { ...basis, risikoAktion: 3, benannt: schlangenkarte(start, 1, 0) })).toMatch(/eigenen Schlange/)
    expect(grund(start, { ...basis, risikoAktion: 1, benannt: idVon(start, 0, 'Blau') })).toMatch(/benennt keine Karte/)
    expect(grund(start, { ...basis, risikoAktion: 5, benannt: null })).toMatch(/Ungültige Aktion/)
  })
})

describe('A8.2/X3 Kriterium 4: überzählige Karten und Speichern', () => {
  it('A8.2: hat der begünstigte Gegner danach mehr als 5 Karten, baut er sie an seinem eigenen Zugende ab', () => {
    const start = risikoTisch({ hand: ['Blau', 'Rot'], spielerzahl: 2, oben: ['Schlangenfrass'], weiter: (bau) => bau.hand(1, ['Violett']) })
    const gegeben = waehle(spieleRisiko(start, 1).zustand, 'spieler-2').zustand
    expect(hand(gegeben, 1)).toHaveLength(7)
    const fremdesEnde = folge(gegeben, farbkarte, zugBeenden)
    expect(ereignisseVom(fremdesEnde.ereignisse, 'AbwerfenVerlangt').map((ereignis) => ereignis.spielerIndex), 'A8.2: am fremden Zugende nicht').toEqual([])
    const eigenesEnde = folge(fremdesEnde.zustand, farbkarte, zugBeenden)
    expect(ereignisseVom(eigenesEnde.ereignisse, 'AbwerfenVerlangt')).toEqual([{ typ: 'AbwerfenVerlangt', spielerIndex: 1, anzahl: 1 }])
  })

  it('X3 Kriterium 3: Speichern und Laden mitten in jeder Risiko-Entscheidung setzt gleich fort', () => {
    const mitSchlange = (oben: 'Grün' | 'Farbendieb' | 'Rot' | 'Violett') => risikoTisch({ hand: ['Blau'], schlange: ['Gelb'], oben: [oben] })
    const zweite = (oben: 'Grün' | 'Farbendieb') => spieleRisiko(mitSchlange(oben), 2, 'blau-01').zustand
    const dritte = (oben: 'Rot' | 'Violett') => {
      const start = mitSchlange(oben)
      return spieleRisiko(start, 3, schlangenkarte(start, 0, 0)).zustand
    }
    const offene: Spielzustand[] = [
      spieleRisiko(risikoTisch({ hand: ['Blau'], oben: ['Schlangenfrass'] }), 1).zustand,
      zweite('Grün'),
      waehle(zweite('Farbendieb'), 'spieler-2').zustand,
      dritte('Rot'),
      dritte('Violett'),
      spieleRisiko(risikoTisch({ hand: ['Blau'], ablage: ['Grün'], oben: ['Rot'] }), 4).zustand,
    ]
    for (const zustand of offene) {
      expect(zustand.entscheidung, 'Testaufbau: eine Entscheidung ist offen').not.toBeNull()
      const geladen = deserialisiere(serialisiere(zustand))
      expect(geladen).toEqual(zustand)
      expect(ermittleAktionen(geladen)).toEqual(ermittleAktionen(zustand))
    }
  })
})
