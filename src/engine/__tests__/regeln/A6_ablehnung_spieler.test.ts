import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, pruefeAktion, zugBeendenGesperrt } from '../../index'
import type { Pruefergebnis, SpielAktion, Spielzustand } from '../../index'
import { baukasten } from '../../testing/szenario'
import { erzeugeZufall } from '../../testing/zufall'
import { zufallszustand } from '../../testing/zufallszustand'

/*
O6, Entscheidung des Orchestrators (Weg A): Die Oberfläche spricht den Menschen
mit „du“ an. Eine Ablehnung, die einen Spieler nennt, trägt deshalb neben dem
deutschen Grund (U12) die Art und die Werte (`nennt`); die Oberfläche
formuliert daraus den Satz. Der Grund der Engine bleibt Zeichen für Zeichen,
wie er war: Engine, KI und Entwicklertisch lesen ihn weiter.

Die sieben Stellen: `pruefeAktion` (entscheidet nicht, nicht am Zug,
Kartenpflicht, Karte nicht auf der Hand, beim Abwerfen fremde Karte und falsche
Anzahl) und `pruefeReaktion` (Farbenschutz nicht auf der Hand).
*/

const abgelehnt = (ergebnis: Pruefergebnis) => {
  if (ergebnis.erlaubt) throw new Error('Testaufbau: Die Aktion ist erlaubt, erwartet war eine Ablehnung.')
  return ergebnis
}

const zuZweit = () =>
  baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(61) })
    .hand(0, ['Rot', 'Blau', 'Gelb', 'Farbenschutz', 'Grün'])
    .hand(1, ['Blau', 'Blau', 'Rot', 'Rot', 'Gelb'])

/** KI-Gegner 1 hat eine Schlangengrube auf Spieler 1 angesagt; Spieler 1 entscheidet. */
const angriff = () =>
  zuZweit()
    .schwebend(1, 'Schlangengrube', (karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-1' }), [0])
    .amZug(1)
    .zustand()

/** Spieler 1 hat seinen Zug beendet und hält 7 Karten (A5). */
const abwerfen = () =>
  baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(62) })
    .hand(0, ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett', 'Braun', 'Farbenschutz'])
    .aendere((zustand) => {
      zustand.zug.abschnitt = 'Abwerfen'
    })
    .zustand()

describe('A5/A6 (O6, Weg A): Ablehnungen, die einen Spieler nennen, tragen Art und Werte; der Text bleibt gleich', () => {
  it('A6: wer gerade nicht entscheidet: entscheidetNicht mit dem Entscheider', () => {
    const ergebnis = abgelehnt(pruefeAktion(angriff(), { typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: null }))
    expect(ergebnis.grund).toBe('KI-Gegner 1 entscheidet gerade nicht; dran ist Spieler 1 (A6).')
    expect(ergebnis.nennt).toEqual({ art: 'entscheidetNicht', spielerIndex: 1, entscheider: 0 })
  })

  it('A5: wer nicht am Zug ist: nichtAmZug mit dem Spieler am Zug', () => {
    const ergebnis = abgelehnt(pruefeAktion(zuZweit().zustand(), { typ: 'ZugBeenden', spielerId: 'spieler-2' }))
    expect(ergebnis.grund).toBe('KI-Gegner 1 ist nicht am Zug; am Zug ist Spieler 1 (A5).')
    expect(ergebnis.nennt).toEqual({ art: 'nichtAmZug', spielerIndex: 1, amZug: 0 })
  })

  it('A5 Wichtig/D12: Kartenpflicht vor der ersten Karte, auch über zugBeendenGesperrt', () => {
    const zustand = zuZweit().zustand()
    const erwartet = { art: 'kartenpflicht', spielerIndex: 0 }
    const ergebnis = abgelehnt(pruefeAktion(zustand, { typ: 'ZugBeenden', spielerId: 'spieler-1' }))
    expect(ergebnis.grund).toBe('Spieler 1 muss erst mindestens eine Karte spielen; beenden ohne Karte geht nur mit leerer Hand (A5, D12).')
    expect(ergebnis.nennt).toEqual(erwartet)
    expect(zugBeendenGesperrt(zustand)).toEqual(ergebnis)
  })

  it('A5: eine Karte, die nicht auf der Hand liegt: nichtAufHand mit der Karte', () => {
    const aktion: SpielAktion = { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: 'rot-99', ziel: { art: 'neueSchlange' } }
    const ergebnis = abgelehnt(pruefeAktion(zuZweit().zustand(), aktion))
    expect(ergebnis.grund).toBe('Die Karte rot-99 liegt nicht auf der Hand von Spieler 1.')
    expect(ergebnis.nennt).toEqual({ art: 'nichtAufHand', spielerIndex: 0, karteId: 'rot-99' })
  })

  it('A5: beim Abwerfen eine fremde Karte: nichtAufHand', () => {
    const zustand = abwerfen()
    const eigene = zustand.spieler[0].hand[0].id
    const ergebnis = abgelehnt(pruefeAktion(zustand, { typ: 'UeberhandAbwerfen', spielerId: 'spieler-1', karteIds: [eigene, 'rot-99'] }))
    expect(ergebnis.grund).toBe('Die Karte rot-99 liegt nicht auf der Hand von Spieler 1.')
    expect(ergebnis.nennt).toEqual({ art: 'nichtAufHand', spielerIndex: 0, karteId: 'rot-99' })
  })

  it('A5: beim Abwerfen die falsche Anzahl: abwerfenAnzahl mit Handgrösse, Soll und genannter Zahl', () => {
    const zustand = abwerfen()
    const eigene = zustand.spieler[0].hand[0].id
    const ergebnis = abgelehnt(pruefeAktion(zustand, { typ: 'UeberhandAbwerfen', spielerId: 'spieler-1', karteIds: [eigene] }))
    expect(ergebnis.grund).toBe('Spieler 1 hält 7 Karten und legt genau 2 Karten ab, nicht 1 (A5).')
    expect(ergebnis.nennt).toEqual({ art: 'abwerfenAnzahl', spielerIndex: 0, haelt: 7, abwerfen: 2, genannt: 1 })
  })

  it('A6/A7.2: ein Farbenschutz, der nicht auf der Hand liegt: nichtAufHand aus pruefeReaktion', () => {
    const ergebnis = abgelehnt(pruefeAktion(angriff(), { typ: 'Reagieren', spielerId: 'spieler-1', farbenschutzId: 'farbenschutz-99' }))
    expect(ergebnis.grund).toBe('Die Karte farbenschutz-99 liegt nicht auf der Hand von Spieler 1.')
    expect(ergebnis.nennt).toEqual({ art: 'nichtAufHand', spielerIndex: 0, karteId: 'farbenschutz-99' })
  })

  it('A6: Gründe ohne Spieler tragen keine Art', () => {
    const ergebnis = abgelehnt(pruefeAktion(angriff(), { typ: 'ZugBeenden', spielerId: 'spieler-2' }))
    expect(ergebnis.grund).toMatch(/schwebt noch/)
    expect(ergebnis.nennt).toBeUndefined()
  })
})

/** Abwandlungen jeder aufgezählten Aktion: jeder Spieler, fremde und unbekannte Karten, jede Reaktion. */
function abwandlungen(zustand: Spielzustand): SpielAktion[] {
  const ids = zustand.spieler.map((spieler) => spieler.id)
  const karten = [...zustand.spieler.flatMap((spieler) => spieler.hand.map((karte) => karte.id)), 'rot-99']
  const liste: SpielAktion[] = []
  for (const aktion of ermittleAktionen(zustand)) {
    for (const spielerId of ids) {
      liste.push({ ...aktion, spielerId })
      if ('karteId' in aktion) for (const karteId of karten.slice(0, 8)) liste.push({ ...aktion, spielerId, karteId })
      if (aktion.typ === 'UeberhandAbwerfen') liste.push({ ...aktion, spielerId, karteIds: aktion.karteIds.slice(1) }, { ...aktion, spielerId, karteIds: [...aktion.karteIds.slice(1), 'rot-99'] })
    }
  }
  for (const spielerId of ids) {
    liste.push({ typ: 'ZugBeenden', spielerId }, { typ: 'Reagieren', spielerId, farbenschutzId: null })
    for (const karteId of karten.slice(0, 6)) liste.push({ typ: 'Reagieren', spielerId, farbenschutzId: karteId })
  }
  return liste
}

describe('A5/A6 (O6, Weg A): Jede Ablehnung mit Spielernamen hat eine Art, jede Art nennt den Spieler aus dem Grund', () => {
  it('A5/A6: in Zufallszuständen und gespielten Partien, über alle Abwandlungen der Aktionen', () => {
    const zustaende: Spielzustand[] = []
    for (let saat = 1; saat <= 120; saat += 1) zustaende.push(zufallszustand(erzeugeZufall(saat)))
    for (let saat = 1; saat <= 6; saat += 1) {
      const zufall = erzeugeZufall(500 + saat)
      let zustand = baukasten({ spielerzahl: 2 + (saat % 3), erweiterung: false, zufall }).haendeAuffuellen().zustand()
      for (let schritt = 0; schritt < 60 && zustand.partiephase !== 'Beendet'; schritt += 1) {
        zustaende.push(zustand)
        const aktionen = ermittleAktionen(zustand)
        zustand = anwendeAktion(zustand, aktionen[Math.floor(zufall() * aktionen.length)]).zustand
      }
    }
    zustaende.push(abwerfen(), angriff())
    const gesehen = new Set<string>()
    let mitName = 0
    for (const zustand of zustaende) {
      const namen = zustand.spieler.map((spieler) => spieler.name)
      for (const aktion of abwandlungen(zustand)) {
        const ergebnis = pruefeAktion(zustand, aktion)
        if (ergebnis.erlaubt) continue
        const genannt = namen.some((name) => ergebnis.grund.includes(name))
        if (!genannt) {
          expect(ergebnis.nennt, `pruefeAktion: Grund ohne Spielernamen trägt keine Art: „${ergebnis.grund}“`).toBeUndefined()
          continue
        }
        mitName += 1
        expect(ergebnis.nennt, `pruefeAktion: Grund mit Spielernamen ohne Art: „${ergebnis.grund}“`).toBeDefined()
        gesehen.add(ergebnis.nennt!.art)
        expect(ergebnis.grund, `pruefeAktion: Art ${ergebnis.nennt!.art} nennt einen Spieler, der im Grund fehlt`).toContain(namen[ergebnis.nennt!.spielerIndex])
      }
    }
    expect(mitName, 'die Stichprobe enthält Ablehnungen mit Spielernamen').toBeGreaterThan(1000)
    expect([...gesehen].sort(), 'jede Art kommt in der Stichprobe vor').toEqual(['abwerfenAnzahl', 'entscheidetNicht', 'kartenpflicht', 'nichtAmZug', 'nichtAufHand'])
  })
})

describe('A6/A7 (O6): Kartennamen mit dem richtigen Artikel', () => {
  const ARTIKEL = {
    Farbenschutz: 'Der',
    Regenbogenschlange: 'Die',
    Schlangenfrass: 'Der',
    Schlangenblockade: 'Die',
    Farbendieb: 'Der',
    Schlangengrube: 'Die',
    Farbenfusion: 'Die',
    Verdoppler: 'Der',
    Schlangenhäutung: 'Die',
    'Schlangenkorb des Glücks': 'Der',
  } as const

  it.each(Object.entries(ARTIKEL))('A6: „%s schwebt noch“ mit bestimmtem Artikel %s', (name, artikel) => {
    const zustand = angriff()
    zustand.schwebend!.karte = { ...zustand.schwebend!.karte, name: name as keyof typeof ARTIKEL }
    const ergebnis = abgelehnt(pruefeAktion(zustand, { typ: 'ZugBeenden', spielerId: 'spieler-2' }))
    expect(ergebnis.grund).toBe(`${artikel} ${name} schwebt noch: Erst entscheiden die Betroffenen, ob sie abwehren (A6).`)
  })

  it('A7.1: falsche Karte für eine Aktion: „ist ein …“ im Nominativ, „braucht einen …“ im Akkusativ', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(63) }).hand(0, ['Farbendieb', 'Rot', 'Blau', 'Gelb', 'Grün']).zustand()
    const dieb = zustand.spieler[0].hand[0].id
    const rot = zustand.spieler[0].hand[1].id
    const alsFarbkarte = abgelehnt(pruefeAktion(zustand, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: dieb, ziel: { art: 'neueSchlange' } }))
    expect(alsFarbkarte.grund).toBe(`Die Karte ${dieb} ist ein Farbendieb; FarbkarteLegen braucht eine Farbkarte.`)
    const alsDieb = abgelehnt(
      pruefeAktion(zustand, { typ: 'FarbendiebSpielen', spielerId: 'spieler-1', karteId: rot, quelle: { schlangenId: 'x', karteId: 'y' }, ziel: { art: 'neueSchlange' } }),
    )
    expect(alsDieb.grund).toBe(`Die Karte ${rot} ist eine Farbkarte; FarbendiebSpielen braucht einen Farbendieb.`)
  })
})
