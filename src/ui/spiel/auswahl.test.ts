import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { erzeugeZufall } from '../../engine/testing/zufall'
import { zufallszustand } from '../../engine/testing/zufallszustand'
import { SZENARIEN, erzeugeSzenario } from '../../entwicklung/szenarien'
import { TISCH_SZENARIEN, angriffAufMich, mittelspiel, zehnHandkarten } from '../tisch/__tests__/szenarien'
import { auswahlstand, waehle, wegZu } from './auswahl'
import type { Auswahl, Wahl } from './auswahl'

/*
O3: `auswahl` führt von der Karte über die Ziele zur fertigen Aktion. Sie baut
keine Aktion (U3): Was sie anbietet und am Ende liefert, kommt allein aus den
Aktionen, die die Engine aufzählt. Die Bedienelemente dazu baut O5.
*/

/** Spielt eine Partie mit gleichverteilter Wahl und liefert jeden zehnten Zustand. */
function zustaendeEinerPartie(spielerzahl: number, saat: number): Spielzustand[] {
  const zufall = erzeugeZufall(saat)
  let zustand = erzeugeSzenario(spielerzahl === 2 ? 'start-2' : 'start-4')
  if (spielerzahl === 3) zustand = erzeugeSzenario('start-erweiterung')
  const gesammelt: Spielzustand[] = []
  for (let schritt = 0; schritt < 400 && zustand.partiephase !== 'Beendet'; schritt += 1) {
    const aktionen = ermittleAktionen(zustand)
    if (schritt % 10 === 0) gesammelt.push(zustand)
    zustand = anwendeAktion(zustand, aktionen[Math.floor(zufall() * aktionen.length)]).zustand
  }
  return gesammelt
}

function pruefzustaende(): { name: string; zustand: Spielzustand }[] {
  return [
    ...SZENARIEN.filter((eintrag) => eintrag.name !== 'kaputt-doppelte-karte').map((eintrag) => ({ name: eintrag.name, zustand: eintrag.erzeuge() })),
    ...TISCH_SZENARIEN.map((eintrag) => ({ name: eintrag.name, zustand: eintrag.erzeuge() })),
    ...Array.from({ length: 40 }, (_, index) => ({ name: `zufallszustand ${index + 1}`, zustand: zufallszustand(erzeugeZufall(index + 1)) })),
    ...[2, 3, 4].flatMap((spieler) => zustaendeEinerPartie(spieler, 100 + spieler).map((zustand, index) => ({ name: `Partie ${spieler} Spieler, Stand ${index * 10}`, zustand }))),
  ]
}

/** Jede vierzigste Aktion reicht, damit auch Stände mit über tausend Farbendieb-Zielen schnell bleiben. */
function stichprobe(aktionen: readonly SpielAktion[]): SpielAktion[] {
  const schritt = Math.max(1, Math.floor(aktionen.length / 40))
  return aktionen.filter((_, index) => index % schritt === 0)
}

/** Folgt dem Weg einer Aktion Wahl für Wahl; jede Wahl muss angeboten sein. */
function folgeWeg(aktionen: readonly SpielAktion[], aktion: SpielAktion): Auswahl {
  const { folge, menge } = wegZu(aktion)
  let auswahl: Auswahl = []
  for (const wahl of [...folge, ...menge]) {
    const { angebote, fertig } = auswahlstand(aktionen, auswahl)
    expect(fertig, `Vor dem Ende des Wegs ist ${JSON.stringify(aktion)} schon fertig`).not.toBe(aktion)
    expect(angebote, `${JSON.stringify(wahl)} ist auf dem Weg zu ${JSON.stringify(aktion)} nicht angeboten`).toContainEqual(wahl)
    auswahl = waehle(aktionen, auswahl, wahl)
  }
  return auswahl
}

const ANGEBOTEN = (aktionen: readonly SpielAktion[], auswahl: Auswahl = []) => auswahlstand(aktionen, auswahl).angebote

describe('O3/U3: Jede aufgezählte Aktion ist über ihre Wahlen erreichbar, und nur sie', () => {
  const zustaende = pruefzustaende()

  it('O3: in Szenarien, Zufallszuständen und gespielten Partien liefert der Weg jeder Aktion genau diese Aktion der Engine', () => {
    const gesehen = new Set<string>()
    for (const { name, zustand } of zustaende) {
      const aktionen = ermittleAktionen(zustand)
      for (const aktion of stichprobe(aktionen)) {
        gesehen.add(aktion.typ)
        const auswahl = folgeWeg(aktionen, aktion)
        expect(auswahlstand(aktionen, auswahl).fertig, `${name}: Weg zu ${JSON.stringify(aktion)}`).toBe(aktion)
      }
    }
    expect([...gesehen].sort()).toEqual(
      [
        'BlockadeLegen', 'Entscheiden', 'FarbendiebSpielen', 'FarbkarteLegen', 'FusionLegen', 'Reagieren', 'RegenbogenschlangeLegen',
        'SchlangenfrassSpielen', 'SchlangengrubeSpielen', 'SchlangenhaeutungSpielen', 'SonderkarteWirkungslosAblegen', 'UeberhandAbwerfen', 'VerdopplerSpielen', 'ZugBeenden',
      ].sort(),
    )
  })

  it('O3: keine zwei Aktionen haben denselben Weg, sonst wäre „fertig“ mehrdeutig', () => {
    for (const { name, zustand } of zustaende) {
      const schluessel = ermittleAktionen(zustand).map((aktion) => {
        const { folge, menge } = wegZu(aktion)
        return JSON.stringify([folge, menge.map((wahl) => JSON.stringify(wahl)).sort()])
      })
      expect(new Set(schluessel).size, `${name}: doppelte Wege`).toBe(schluessel.length)
    }
  })

  it('O3: jedes Angebot führt zu mindestens einer Aktion; ohne Aktionen gibt es nichts anzubieten', () => {
    const aktionen = ermittleAktionen(mittelspiel())
    for (const wahl of ANGEBOTEN(aktionen)) {
      const weiter = auswahlstand(aktionen, waehle(aktionen, [], wahl))
      expect(weiter.fertig !== null || weiter.angebote.length > 0, `${JSON.stringify(wahl)} führt ins Leere`).toBe(true)
    }
    expect(auswahlstand([], [])).toEqual({ angebote: [], fertig: null })
  })
})

describe('O3: Karte wählen, dann Ziel wählen', () => {
  it('O3/D9: nach einer Farbkarte sind beide Enden jeder Schlange angeboten, auch der gegnerischen', () => {
    const zustand = erzeugeSzenario('farbkarte-beim-gegner')
    const aktionen = ermittleAktionen(zustand)
    const rot = zustand.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte' && karte.farbe === 'Rot')!
    const auswahl = waehle(aktionen, [], { art: 'karte', karteId: rot.id })
    const erwartet: Wahl[] = ['schlange-1', 'schlange-2', 'schlange-3'].flatMap((schlangenId) => [
      { art: 'schlangenende', schlangenId, seite: 'anfang' },
      { art: 'schlangenende', schlangenId, seite: 'ende' },
    ])
    expect(ANGEBOTEN(aktionen, auswahl)).toEqual(expect.arrayContaining(erwartet))
    expect(ANGEBOTEN(aktionen, auswahl)).toHaveLength(6)
    const fertig = auswahlstand(aktionen, waehle(aktionen, auswahl, { art: 'schlangenende', schlangenId: 'schlange-3', seite: 'ende' })).fertig
    expect(fertig).toEqual({ typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: rot.id, ziel: { art: 'schlange', schlangenId: 'schlange-3', seite: 'ende' } })
  })

  it('O3: am Anfang sind genau die spielbaren Handkarten und „Zug beenden“ angeboten, wie die Engine sie nennt', () => {
    const zustand = mittelspiel()
    const aktionen = ermittleAktionen(zustand)
    const erwartet = new Set(aktionen.flatMap((aktion) => ('karteId' in aktion ? [aktion.karteId] : [])))
    const karten = ANGEBOTEN(aktionen).flatMap((wahl) => (wahl.art === 'karte' ? [wahl.karteId] : []))
    expect(new Set(karten)).toEqual(erwartet)
    expect(ANGEBOTEN(aktionen).some((wahl) => wahl.art === 'zugBeenden')).toBe(aktionen.some((aktion) => aktion.typ === 'ZugBeenden'))
  })

  it('O3/A7.4: Schlangenfrass mit zwei Karten: erst die Option, dann beide Karten in beliebiger Reihenfolge', () => {
    const zustand = erzeugeSzenario('frass-zwei-spieler')
    const aktionen = ermittleAktionen(zustand)
    const frass = zustand.spieler[0].hand[0]
    const [blau] = zustand.spieler[1].schlangen[0].karten
    const [gelb] = zustand.spieler[2].schlangen[0].karten
    let auswahl = waehle(aktionen, [], { art: 'karte', karteId: frass.id })
    expect(ANGEBOTEN(aktionen, auswahl)).toEqual([{ art: 'frass', option: 'gegnerischeKarten' }])
    auswahl = waehle(aktionen, auswahl, { art: 'frass', option: 'gegnerischeKarten' })
    auswahl = waehle(aktionen, auswahl, { art: 'schlangenkarte', schlangenId: 'schlange-2', karteId: gelb.id })
    expect(auswahlstand(aktionen, auswahl).fertig, 'eine Karte allein ist kein Paar').toBeNull()
    auswahl = waehle(aktionen, auswahl, { art: 'schlangenkarte', schlangenId: 'schlange-1', karteId: blau.id })
    const fertig = auswahlstand(aktionen, auswahl).fertig
    expect(fertig?.typ).toBe('SchlangenfrassSpielen')
    expect(aktionen).toContain(fertig)
    expect(fertig !== null && fertig.typ === 'SchlangenfrassSpielen' ? fertig.ziele.map((ziel) => ziel.karteId).sort() : []).toEqual([blau.id, gelb.id].sort())
  })

  it('O3/A7.8: ein Verdoppler ist mit der Karte allein fertig', () => {
    const zustand = erzeugeSzenario('verdoppler')
    const aktionen = ermittleAktionen(zustand)
    const verdoppler = zustand.spieler[0].hand[0]
    const { fertig } = auswahlstand(aktionen, waehle(aktionen, [], { art: 'karte', karteId: verdoppler.id }))
    expect(fertig).toEqual({ typ: 'VerdopplerSpielen', spielerId: 'spieler-1', karteId: verdoppler.id })
  })

  it('O3/A5: am Zugende wählt der Mensch genau so viele Karten zum Abwerfen, wie die Engine verlangt, in beliebiger Reihenfolge', () => {
    const zustand = zehnHandkarten()
    const aktionen = ermittleAktionen(zustand)
    const anzahl = aktionen[0].typ === 'UeberhandAbwerfen' ? aktionen[0].karteIds.length : -1
    expect(anzahl).toBe(5)
    const hand = zustand.spieler[0].hand.map((karte) => karte.id)
    let auswahl: Auswahl = []
    for (const karteId of [hand[9], hand[0], hand[4], hand[2]]) auswahl = waehle(aktionen, auswahl, { art: 'abwerfen', karteId })
    expect(auswahlstand(aktionen, auswahl).fertig).toBeNull()
    auswahl = waehle(aktionen, auswahl, { art: 'abwerfen', karteId: hand[7] })
    const fertig = auswahlstand(aktionen, auswahl).fertig
    expect(fertig).toEqual({ typ: 'UeberhandAbwerfen', spielerId: 'spieler-1', karteIds: [hand[0], hand[2], hand[4], hand[7], hand[9]] })
    expect(aktionen).toContain(fertig)
  })

  it('O3/A6, D33: wird der Mensch angegriffen, sind „durchlassen“ und je Farbenschutz „abwehren“ angeboten', () => {
    const zustand = angriffAufMich()
    const aktionen = ermittleAktionen(zustand)
    const farbenschutz = zustand.spieler[0].hand.filter((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz').map((karte) => karte.id)
    expect(ANGEBOTEN(aktionen)).toEqual([...farbenschutz.map((farbenschutzId): Wahl => ({ art: 'abwehren', farbenschutzId })), { art: 'durchlassen' }])
    expect(auswahlstand(aktionen, waehle(aktionen, [], { art: 'durchlassen' })).fertig).toEqual({ typ: 'Reagieren', spielerId: 'spieler-1', farbenschutzId: null })
  })
})

describe('O3: Auswahl aufheben und wechseln', () => {
  it('O3: dieselbe Karte noch einmal gewählt hebt die ganze Auswahl auf', () => {
    const zustand = erzeugeSzenario('regenbogen')
    const aktionen = ermittleAktionen(zustand)
    const regenbogen: Wahl = { art: 'karte', karteId: zustand.spieler[0].hand[0].id }
    const auswahl = waehle(aktionen, waehle(aktionen, [], regenbogen), { art: 'schlange', schlangenId: 'schlange-1' })
    expect(waehle(aktionen, auswahl, regenbogen)).toEqual([])
  })

  it('O3: ein gewähltes Ziel noch einmal gewählt nimmt nur dieses zurück', () => {
    const zustand = erzeugeSzenario('frass-zwei-spieler')
    const aktionen = ermittleAktionen(zustand)
    const blau: Wahl = { art: 'schlangenkarte', schlangenId: 'schlange-1', karteId: zustand.spieler[1].schlangen[0].karten[0].id }
    const gelb: Wahl = { art: 'schlangenkarte', schlangenId: 'schlange-2', karteId: zustand.spieler[2].schlangen[0].karten[0].id }
    const anfang: Auswahl = [{ art: 'karte', karteId: zustand.spieler[0].hand[0].id }, { art: 'frass', option: 'gegnerischeKarten' }]
    const beide = waehle(aktionen, waehle(aktionen, anfang, blau), gelb)
    expect(waehle(aktionen, beide, blau)).toEqual([...anfang, gelb])
  })

  it('O3: eine andere Handkarte wechselt die Auswahl auf sie', () => {
    const zustand = mittelspiel()
    const aktionen = ermittleAktionen(zustand)
    const [erste, zweite] = ANGEBOTEN(aktionen).filter((wahl) => wahl.art === 'karte')
    expect(waehle(aktionen, waehle(aktionen, [], erste), zweite)).toEqual([zweite])
  })

  it('O3: eine Wahl, die nicht angeboten ist, lehnt die Auswahl mit Grund ab, statt sie still zu übergehen', () => {
    const aktionen = ermittleAktionen(mittelspiel())
    expect(() => waehle(aktionen, [], { art: 'spieler', spielerId: 'spieler-9' })).toThrow(/nicht angeboten/)
  })
})
