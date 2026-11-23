import { describe, expect, it } from 'vitest'
import { ermittleAktionen, ermittleEntscheider } from '../../index'
import type { Spielzustand } from '../../index'
import type { Kartenwahl } from '../../testing/szenario'
import { ereignisseVom, hand, ablage } from '../zugablauf_hilfen'
import { typenDer } from '../rahmen_hilfen'
import { idVon, risikoTisch, schlangenkarte, spieleRisiko, waehle, wahlen } from '../risiko_hilfen'

/*
X5, Kriterium 4 und 5: die vier Risiko-Aktionen (A8.2), je mit Erfolg und
Misserfolg und dem Verbleib jeder Karte nach D51 bis D54. Die oberste Karte
des Nachziehstapels wird offen aufgedeckt; eine Farbkarte heisst Erfolg, eine
Sonderkarte Misserfolg (bei Aktion 3 zählt dazu der Punktewert). Bei
Misserfolg wählt der Spieler am Zug frei den begünstigten Gegner, und wo der
Gegner die Wahl hat, wählt er selbst (D52, D54); die Engine nennt jeweils den
Entscheider (X3).
*/

const RISIKO = 'risiko-belohnung-01'

function imSpiel(zustand: Spielzustand): string[] {
  return zustand.ausDemSpiel.map((karte) => karte.id)
}

describe('A8.2 Aktion 1: Zusätzliche Karten ziehen', () => {
  it('A8.2 Aktion 1, Erfolg: die aufgedeckte Farbkarte kommt auf die Hand, dazu zwei weitere Karten; keine Entscheidung', () => {
    const start = risikoTisch({ hand: ['Blau', 'Rot'], oben: ['Gelb', 'Grün', 'Braun', 'Violett'] })
    const gelb = start.nachziehstapel[0].id
    const schritt = spieleRisiko(start, 1)
    expect(typenDer(schritt.ereignisse)).toEqual(['KartenVersetzt', 'RisikoKarteGespielt', 'KartenVersetzt'])
    expect(ereignisseVom(schritt.ereignisse, 'KartenVersetzt')[0].karten, 'A8.2: offen aufgedeckt').toEqual([
      { karteId: gelb, von: { ort: 'Nachziehstapel' }, nach: { ort: 'Aufgedeckt', position: 0 } },
    ])
    expect(ereignisseVom(schritt.ereignisse, 'RisikoKarteGespielt')).toEqual([
      { typ: 'RisikoKarteGespielt', spielerIndex: 0, karteId: RISIKO, risikoAktion: 1, benannt: null, aufgedeckt: gelb, erfolg: true },
    ])
    expect(hand(schritt.zustand, 0)).toEqual(expect.arrayContaining([gelb, start.nachziehstapel[1].id, start.nachziehstapel[2].id]))
    expect(hand(schritt.zustand, 0)).toHaveLength(5)
    expect(schritt.zustand.nachziehstapel).toHaveLength(start.nachziehstapel.length - 3)
    expect(schritt.zustand.entscheidung).toBeNull()
    expect(ermittleEntscheider(schritt.zustand), 'A8.2: der Spieler spielt seinen Zug weiter').toBe(0)
  })

  it('A8.2 Aktion 1, Misserfolg: der Spieler wählt frei einen Gegner, der die aufgedeckte Sonderkarte auf die Hand nimmt', () => {
    const start = risikoTisch({ hand: ['Blau', 'Rot'], oben: ['Schlangenfrass'] })
    const frass = start.nachziehstapel[0].id
    const schritt = spieleRisiko(start, 1)
    expect(typenDer(schritt.ereignisse)).toEqual(['KartenVersetzt', 'RisikoKarteGespielt', 'EntscheidungVerlangt'])
    expect(ereignisseVom(schritt.ereignisse, 'RisikoKarteGespielt')[0]).toMatchObject({ aufgedeckt: frass, erfolg: false })
    expect(ermittleEntscheider(schritt.zustand), 'A8.2 „Freie Wahl bei Misserfolg“: der Spieler am Zug').toBe(0)
    expect(wahlen(schritt.zustand)).toEqual(['spieler-2', 'spieler-3'])
    expect(schritt.zustand.aufgedeckt.map((karte) => karte.id)).toEqual([frass])
    const gegeben = waehle(schritt.zustand, 'spieler-3')
    expect(hand(gegeben.zustand, 2)).toContain(frass)
    expect(hand(gegeben.zustand, 2)).toHaveLength(6)
    expect(gegeben.zustand.aufgedeckt).toEqual([])
    expect(ermittleEntscheider(gegeben.zustand)).toBe(0)
  })
})

describe('A8.2 Aktion 2: Zusätzliche Farbkarte spielen (D51, D52)', () => {
  const tisch = (oben: Kartenwahl[]) => risikoTisch({ hand: ['Rot', 'Gelb', 'Farbenschutz'], schlange: ['Blau', 'Blau'], oben: oben })

  it('D52: angeboten wird Aktion 2 je Farbkarte der Hand, die der Spieler vorher benennt; die Ansage nennt sie offen', () => {
    const start = tisch(['Grün'])
    const benannt = ermittleAktionen(start).flatMap((aktion) => (aktion.typ === 'RisikoKarteSpielen' && aktion.risikoAktion === 2 ? [aktion.benannt] : []))
    expect(benannt).toEqual([idVon(start, 0, 'Rot'), idVon(start, 0, 'Gelb')])
    const schritt = spieleRisiko(start, 2, idVon(start, 0, 'Rot'))
    expect(ereignisseVom(schritt.ereignisse, 'RisikoKarteGespielt')[0]).toMatchObject({ risikoAktion: 2, benannt: idVon(start, 0, 'Rot') })
  })

  it('A8.2 Aktion 2, Erfolg (D51, D52): die aufgedeckte Farbkarte kommt auf die Hand; der Spieler legt sofort eine Farbkarte der Hand an ein Ende einer eigenen Schlange', () => {
    const start = tisch(['Grün'])
    const gruen = start.nachziehstapel[0].id
    const schritt = spieleRisiko(start, 2, idVon(start, 0, 'Rot'))
    expect(ereignisseVom(schritt.ereignisse, 'RisikoKarteGespielt')[0]).toMatchObject({ aufgedeckt: gruen, erfolg: true })
    expect(hand(schritt.zustand, 0), 'D51: die aufgedeckte Farbkarte auf die eigene Hand').toContain(gruen)
    expect(ermittleEntscheider(schritt.zustand)).toBe(0)
    const eigene = schritt.zustand.spieler[0].schlangen[0].id
    const erwartet = [idVon(start, 0, 'Rot'), idVon(start, 0, 'Gelb'), gruen].flatMap((id) => [`${id} ${eigene} anfang`, `${id} ${eigene} ende`])
    expect(wahlen(schritt.zustand).sort(), 'D52: nur an ein Ende einer eigenen Schlange, nie in die Schlange eines Gegners').toEqual(erwartet.sort())
    const gelegt = waehle(schritt.zustand, `${gruen} ${eigene} ende`)
    expect(gelegt.zustand.spieler[0].schlangen[0].karten.map((karte) => karte.id).at(-1)).toBe(gruen)
    expect(gelegt.zustand.entscheidung).toBeNull()
  })

  it('A8.2 Aktion 2, Erfolg: legt er eine andere Karte der Hand an, behält er die gezogene Farbkarte', () => {
    const start = tisch(['Grün'])
    const gruen = start.nachziehstapel[0].id
    const rot = idVon(start, 0, 'Rot')
    const schritt = spieleRisiko(start, 2, rot)
    const eigene = schritt.zustand.spieler[0].schlangen[0].id
    const gelegt = waehle(schritt.zustand, `${rot} ${eigene} anfang`)
    expect(gelegt.zustand.spieler[0].schlangen[0].karten[0].id).toBe(rot)
    expect(hand(gelegt.zustand, 0)).toContain(gruen)
  })

  it('A8.2 Aktion 2, Misserfolg (D51, D52): die Sonderkarte kommt auf den eigenen Ablagestapel; der gewählte Gegner nimmt die geplante Farbkarte', () => {
    const start = tisch(['Farbendieb', 'Violett'])
    const dieb = start.nachziehstapel[0].id
    const rot = idVon(start, 0, 'Rot')
    const schritt = spieleRisiko(start, 2, rot)
    expect(ablage(schritt.zustand, 0), 'D51: der Spieler verliert die aufgedeckte Karte').toEqual([dieb])
    expect(wahlen(schritt.zustand)).toEqual(['spieler-2', 'spieler-3'])
    const gegner = waehle(schritt.zustand, 'spieler-2')
    expect(ermittleEntscheider(gegner.zustand), 'D52: der begünstigte Gegner wählt').toBe(1)
    expect(wahlen(gegner.zustand)).toEqual(['geplante', 'stapel'])
    expect(gegner.zustand.zug.spielerIndex, 'am Zug bleibt Spieler 1').toBe(0)
    const genommen = waehle(gegner.zustand, 'geplante')
    expect(hand(genommen.zustand, 1)).toContain(rot)
    expect(hand(genommen.zustand, 0)).not.toContain(rot)
    expect(ermittleEntscheider(genommen.zustand)).toBe(0)
  })

  it('A8.2 Aktion 2, Misserfolg (D52): wählt der Gegner die oberste Stapelkarte, behält der Spieler seine geplante Farbkarte', () => {
    const start = tisch(['Farbendieb', 'Violett'])
    const violett = start.nachziehstapel[1].id
    const rot = idVon(start, 0, 'Rot')
    const gegner = waehle(spieleRisiko(start, 2, rot).zustand, 'spieler-3')
    const gezogen = waehle(gegner.zustand, 'stapel')
    expect(hand(gezogen.zustand, 2)).toContain(violett)
    expect(hand(gezogen.zustand, 0)).toContain(rot)
  })
})

describe('A8.2 Aktion 3: Karten tauschen (D51, D53)', () => {
  // Blau und Gelb zählen 1, Violett 2 Punkte (A1).
  const tisch = (oben: Kartenwahl[]) => risikoTisch({ hand: ['Rot', 'Gelb', 'Verdoppler'], schlange: ['Blau', 'Grün', 'Braun'], oben: oben })

  it('A8.2 Aktion 3: benannt wird vorher eine Farbkarte der eigenen Schlange; angeboten ist jede, keine aus einer fremden Schlange', () => {
    const start = tisch(['Rot'])
    const benannt = ermittleAktionen(start).flatMap((aktion) => (aktion.typ === 'RisikoKarteSpielen' && aktion.risikoAktion === 3 ? [aktion.benannt] : []))
    expect(benannt).toEqual(start.spieler[0].schlangen[0].karten.map((karte) => karte.id))
  })

  it('A8.2 Aktion 3, Erfolg (D51, D53): gleicher Punktewert; die aufgedeckte Karte kommt auf die Hand, eine Farbkarte der Hand ersetzt die benannte, die ersetzte kommt auf die Hand', () => {
    const start = tisch(['Rot'])
    const blau = schlangenkarte(start, 0, 0)
    const rotOben = start.nachziehstapel[0].id
    const schritt = spieleRisiko(start, 3, blau)
    expect(ereignisseVom(schritt.ereignisse, 'RisikoKarteGespielt')[0]).toMatchObject({ benannt: blau, aufgedeckt: rotOben, erfolg: true })
    expect(hand(schritt.zustand, 0), 'D51: die aufgedeckte Farbkarte auf die eigene Hand').toContain(rotOben)
    const gelb = idVon(start, 0, 'Gelb')
    expect(wahlen(schritt.zustand).sort(), 'D53: jede Farbkarte der Hand, auch die aufgedeckte').toEqual([idVon(start, 0, 'Rot'), gelb, rotOben, 'kein Tausch'].sort())
    const getauscht = waehle(schritt.zustand, gelb)
    expect(getauscht.zustand.spieler[0].schlangen[0].karten.map((karte) => karte.id)).toEqual([gelb, schlangenkarte(start, 0, 1), schlangenkarte(start, 0, 2)])
    expect(hand(getauscht.zustand, 0), 'D51: die ersetzte Schlangenkarte kommt auf die eigene Hand').toContain(blau)
    expect(hand(getauscht.zustand, 0)).not.toContain(gelb)
  })

  it('A8.2 Aktion 3, Erfolg: „Du darfst den Tausch ausführen“ – er darf auch verzichten; die Schlange bleibt, die aufgedeckte Karte behält er', () => {
    const start = tisch(['Gelb'])
    const blau = schlangenkarte(start, 0, 0)
    const schritt = spieleRisiko(start, 3, blau)
    const verzichtet = waehle(schritt.zustand, 'kein Tausch')
    expect(verzichtet.zustand.spieler[0].schlangen[0].karten.map((karte) => karte.id)).toEqual(start.spieler[0].schlangen[0].karten.map((karte) => karte.id))
    expect(hand(verzichtet.zustand, 0)).toContain(start.nachziehstapel[0].id)
  })

  it.each([
    ['davor', 0],
    ['dahinter', 1],
  ])('A8.2 Aktion 3, Misserfolg mit anderem Punktewert (D53): die Karte kommt zusätzlich an die Stelle der gewählten, %s', (seite, stelle) => {
    const start = tisch(['Violett'])
    const blau = schlangenkarte(start, 0, 0)
    const violett = start.nachziehstapel[0].id
    const schritt = spieleRisiko(start, 3, blau)
    expect(ereignisseVom(schritt.ereignisse, 'RisikoKarteGespielt')[0]).toMatchObject({ erfolg: false })
    expect(wahlen(schritt.zustand)).toEqual(['davor', 'dahinter'])
    const gelegt = waehle(schritt.zustand, seite as string)
    const karten = gelegt.zustand.spieler[0].schlangen[0].karten.map((karte) => karte.id)
    expect(karten).toHaveLength(4)
    expect(karten[stelle as number]).toBe(violett)
    expect(karten[1 - (stelle as number)]).toBe(blau)
    expect(hand(gelegt.zustand, 0)).toHaveLength(3)
  })

  it('A8.2 Aktion 3, Misserfolg mit Sonderkarte: die Aktion scheitert vollständig, die Sonderkarte kommt auf den eigenen Ablagestapel', () => {
    const start = tisch(['Schlangenblockade'])
    const blockade = start.nachziehstapel[0].id
    const schritt = spieleRisiko(start, 3, schlangenkarte(start, 0, 1))
    expect(typenDer(schritt.ereignisse)).toEqual(['KartenVersetzt', 'RisikoKarteGespielt', 'KartenVersetzt'])
    expect(ablage(schritt.zustand, 0)).toEqual([blockade])
    expect(schritt.zustand.spieler[0].schlangen).toEqual(start.spieler[0].schlangen)
    expect(schritt.zustand.entscheidung).toBeNull()
  })
})

describe('A8.2 Aktion 4: Karten aus dem Ablage- oder Nachziehstapel (D51, D54)', () => {
  const tisch = (oben: Kartenwahl[], eigeneAblage: Kartenwahl[] = ['Farbendieb', 'Grün']) =>
    risikoTisch({ hand: ['Rot'], ablage: eigeneAblage, oben: oben, weiter: (bau) => bau.ablage(1, ['Verdoppler']) })

  it('A8.2 Aktion 4, Erfolg (D54): die aufgedeckte Karte ist die erste von zwei; „stapel“ zieht eine weitere', () => {
    const start = tisch(['Gelb', 'Blau'])
    const [gelb, blau] = start.nachziehstapel.map((karte) => karte.id)
    const schritt = spieleRisiko(start, 4)
    expect(hand(schritt.zustand, 0), 'D51: bei Erfolg auf die eigene Hand').toContain(gelb)
    expect(ermittleEntscheider(schritt.zustand)).toBe(0)
    expect(wahlen(schritt.zustand), 'B2: die Wahl nennt die Stelle im offenen Ablagestapel, keine Id, weil die Karte danach auf der Hand liegt').toEqual(['ablagestapel-0', 'ablagestapel-1', 'stapel'])
    const gezogen = waehle(schritt.zustand, 'stapel')
    expect(hand(gezogen.zustand, 0)).toEqual(expect.arrayContaining([gelb, blau]))
    expect(hand(gezogen.zustand, 0)).toHaveLength(3)
  })

  it('A8.2 Aktion 4, Erfolg: oder eine beliebige Karte vom eigenen Ablagestapel auf die Hand', () => {
    const start = tisch(['Gelb'])
    const dieb = idVon(start, 0, 'Farbendieb', 'ablagestapel')
    const genommen = waehle(spieleRisiko(start, 4).zustand, 'ablagestapel-0')
    expect(hand(genommen.zustand, 0)).toContain(dieb)
    expect(ablage(genommen.zustand, 0)).toEqual([idVon(start, 0, 'Grün', 'ablagestapel')])
  })

  it('D54: ist der eigene Ablagestapel leer, bleibt bei Erfolg nur der Nachziehstapel', () => {
    const start = tisch(['Gelb'], [])
    expect(wahlen(spieleRisiko(start, 4).zustand)).toEqual(['stapel'])
  })

  it('A8.2 Aktion 4 „Wichtig“: der Schlangenkorb lässt sich nicht vom Ablagestapel nehmen', () => {
    const start = tisch(['Gelb'], ['Schlangenkorb des Glücks', 'Grün'])
    expect(wahlen(spieleRisiko(start, 4).zustand)).toEqual(['ablagestapel-1', 'stapel'])
  })

  it('A8.2 Aktion 4, Misserfolg (D51, D54): die Sonderkarte kommt auf den eigenen Ablagestapel; der gewählte Gegner nimmt eine Karte aus seinem Ablagestapel', () => {
    const start = tisch(['Schlangengrube'])
    const grube = start.nachziehstapel[0].id
    const schritt = spieleRisiko(start, 4)
    expect(ablage(schritt.zustand, 0).at(-1), 'D51: bei Misserfolg auf den eigenen Ablagestapel').toBe(grube)
    expect(wahlen(schritt.zustand)).toEqual(['spieler-2', 'spieler-3'])
    const gegner = waehle(schritt.zustand, 'spieler-2')
    expect(ermittleEntscheider(gegner.zustand), 'A8.2: der Gegner deiner Wahl darf wählen').toBe(1)
    const verdoppler = idVon(start, 1, 'Verdoppler', 'ablagestapel')
    expect(wahlen(gegner.zustand)).toEqual(['ablagestapel-0', 'stapel'])
    const genommen = waehle(gegner.zustand, 'ablagestapel-0')
    expect(hand(genommen.zustand, 1)).toContain(verdoppler)
    expect(ablage(genommen.zustand, 1)).toEqual([])
  })

  it('A8.2 Aktion 4, Misserfolg (D54): hat der Gegner keinen Ablagestapel, bleibt ihm die oberste Stapelkarte', () => {
    const start = tisch(['Schlangengrube', 'Braun'])
    const braun = start.nachziehstapel[1].id
    const gegner = waehle(spieleRisiko(start, 4).zustand, 'spieler-3')
    expect(wahlen(gegner.zustand)).toEqual(['stapel'])
    const gezogen = waehle(gegner.zustand, 'stapel')
    expect(hand(gezogen.zustand, 2)).toContain(braun)
    expect(imSpiel(gezogen.zustand)).toContain(RISIKO)
  })
})
