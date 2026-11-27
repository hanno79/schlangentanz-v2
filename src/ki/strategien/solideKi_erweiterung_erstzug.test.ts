// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, erstellePartie, erzeugeZufall } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { kiWahl } from '../schritt'
import { entscheiderVon, sichtFuer } from '../sicht'
import { aufgabenwert, gruppenzahl } from '../__tests__/stellungen'
import { bewerte } from './bewertung'
import { ERSTZUG_HALTEN, imErstenZug, setztAuslageEin } from './eroeffnung'
import { erstelleSolideKi } from './solideKi'
import { ziehtVerdeckt } from './ziehen'

/*
K4, Kriterium 2 im ersten Zug (Entscheid des Orchestrators vom 27.11.2026): Comeback-Karte,
Risiko-Karte und Schlangenkorb setzt die solide KI im ersten Zug nur ein, wenn der Zug eine
Gruppe vollendet, eine Aufgabe erfüllt oder die Bewertung um mehr als den Haltewert steigt.
Geprüft an Zufallsstarthänden: Partien mit Erweiterung, 2 bis 4 Spieler, die solide KI an
allen Sitzen, bis jeder seinen ersten Zug gespielt hat. Den Haltewert belegen Spiegelpartien
(Testregister TF-KI-041); sie dauern zu lange für die Suite.
*/

interface Schritt {
  vorher: Spielzustand
  aktion: SpielAktion
  nachher: Spielzustand
}

/** Die ersten Züge aller Sitze einer Partie, je Sitz seine eigenen Entscheidungen in diesem Zug. */
function ersteZuege(saat: number, spielerzahl: number): Schritt[][] {
  let zustand = erstellePartie({ spielerzahl, erweiterung: true, zufall: erzeugeZufall(saat) })
  const kis = Array.from({ length: spielerzahl }, (_, sitz) => erstelleSolideKi(erzeugeZufall(saat * 7 + sitz)))
  const zuege: Schritt[][] = kis.map(() => [])
  const fertig = new Set<number>()
  while (fertig.size < spielerzahl && zustand.partiephase === 'Laufend') {
    const am = zustand.zug.spielerIndex
    const entscheider = entscheiderVon(zustand)!.index
    const aktion = kiWahl(zustand, kis[entscheider])!
    const nachher = anwendeAktion(zustand, aktion).zustand
    if (entscheider === am && !fertig.has(am)) {
      zuege[am].push({ vorher: zustand, aktion, nachher })
      // Der Zug ist zu Ende, wenn ein anderer dran ist oder nach „Zug beenden“ ein neuer Zug beginnt (nicht der zweite nach einem Verdoppler).
      const neuerZug = nachher.zug.spielerIndex !== am || ((aktion.typ === 'ZugBeenden' || aktion.typ === 'UeberhandAbwerfen') && nachher.zug.teilzug === 1 && nachher.zug.abschnitt === 'Ausspielen' && nachher.zug.verwendet.length === 0)
      if (neuerZug) fertig.add(am)
    }
    zustand = nachher
  }
  return zuege.filter((zug) => zug.length > 0)
}

const PARTIEN = Array.from({ length: 24 }, (_, nummer) => ({ saat: 91_000 + nummer, spielerzahl: 2 + (nummer % 3) }))
const ZUEGE = PARTIEN.flatMap(({ saat, spielerzahl }) => ersteZuege(saat, spielerzahl).map((zug) => ({ saat, zug })))

/** Die Bewertung der Zugsuche ab `start` für den Spieler am Zug, auf dem echten Zustand. */
function wert(start: Spielzustand, zustand: Spielzustand): number {
  const sitz = start.zug.spielerIndex
  return bewerte(sichtFuer(zustand, sitz)) + aufgabenwert(start, zustand, sitz)
}

describe('K4 Kriterium 2 im ersten Zug an Zufallsstarthänden', () => {
  it('K4.2: die Sicht erkennt den ersten Zug in jeder seiner Entscheidungen (`imErstenZug`)', () => {
    const verfehlt = ZUEGE.flatMap(({ saat, zug }) => zug.filter(({ vorher }) => !imErstenZug(sichtFuer(vorher, vorher.zug.spielerIndex))).map(({ aktion }) => `Saat ${saat}: ${aktion.typ}`))
    expect(ZUEGE.length, 'Testaufbau: jeder Sitz hat einen ersten Zug').toBe(PARTIEN.reduce((summe, { spielerzahl }) => summe + spielerzahl, 0))
    expect(verfehlt, 'K4.2: Entscheidungen im ersten Zug, die die Sicht nicht als ersten Zug erkennt').toEqual([])
  })

  it('K4.2: in höchstens jedem zehnten ersten Zug setzt sie Comeback-Karte, Risiko-Karte oder Schlangenkorb ein', () => {
    const mitKarte = ZUEGE.filter(({ zug }) => zug.some(({ aktion }) => setztAuslageEin(aktion)))
    expect(mitKarte.length, `K4.2: ${mitKarte.length} von ${ZUEGE.length} ersten Zügen, ${JSON.stringify(mitKarte.map(({ saat, zug }) => `${saat}: ${zug.map(({ aktion }) => aktion.typ).join(' ')}`))}`).toBeLessThanOrEqual(ZUEGE.length / 10)
  })

  it('K4.2: setzt sie im ersten Zug Comeback-Karte oder Korb ohne verdeckte Karte ein, vollendet der Zug eine Gruppe, erfüllt eine Aufgabe oder steigt um mehr als den Haltewert', () => {
    for (const { saat, zug } of ZUEGE) {
      const stelle = zug.findIndex(({ aktion }) => setztAuslageEin(aktion) && aktion.typ !== 'RisikoKarteSpielen' && !ziehtVerdeckt(aktion))
      if (stelle < 0) continue
      const start = zug[stelle].vorher
      const sitz = start.zug.spielerIndex
      const rest = zug.slice(stelle)
      const schluss = rest.findIndex(({ aktion }, index) => index > 0 && (aktion.typ === 'ZugBeenden' || aktion.typ === 'RisikoKarteSpielen' || ziehtVerdeckt(aktion)))
      const ende = schluss < 0 ? rest[rest.length - 1].nachher : rest[schluss].vorher
      const gruppe = gruppenzahl(ende, sitz) > gruppenzahl(start, sitz)
      const aufgabe = ende.spieler[sitz].erfuellteAufgaben.length > start.spieler[sitz].erfuellteAufgaben.length || (ende.spieler[sitz].geheimeAufgabeErfuellt && !start.spieler[sitz].geheimeAufgabeErfuellt)
      const steigt = wert(start, ende) - wert(start, start)
      expect(gruppe || aufgabe || steigt > ERSTZUG_HALTEN, `K4.2: Saat ${saat}, ${JSON.stringify(zug[stelle].aktion)}, Bewertung steigt um ${steigt.toFixed(2)}`).toBe(true)
    }
  })
})

describe('K4 Kriterium 2: der erste Zug nach Risiko-Aktion 3 (Codex-Befund 2, Iteration 2)', () => {
  it('A8.2, D53: legt Risiko-Aktion 3 die aufgedeckte Farbkarte neben die benannte, ist es weiter der erste Zug', () => {
    let zustand = baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(53) })
      .hand(1, ['Rot', 'Blau', 'Schlangenkorb des Glücks', 'Farbenschutz', 'Farbenschutz'])
      .haendeAuffuellen()
      .stapelOben(['Grün'])
      .amZug(1)
      .zustand()
    const spiele = (passt: (aktion: SpielAktion) => boolean) => {
      const aktion = ermittleAktionen(zustand).find(passt)
      if (aktion === undefined) throw new Error(`Testaufbau: keine passende Aktion unter ${JSON.stringify(ermittleAktionen(zustand))}`)
      zustand = anwendeAktion(zustand, aktion).zustand
    }
    spiele((aktion) => aktion.typ === 'FarbkarteLegen' && aktion.ziel.art === 'neueSchlange' && aktion.karteId.startsWith('rot'))
    const rot = zustand.spieler[1].schlangen[0].karten[0].id
    spiele((aktion) => aktion.typ === 'RisikoKarteSpielen' && aktion.risikoAktion === 3 && aktion.benannt === rot)
    while (zustand.entscheidung !== null) spiele((aktion) => aktion.typ === 'Entscheiden')
    const farben = zustand.spieler[1].schlangen.flatMap((schlange) => schlange.karten.map((karte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name)))
    expect(farben, 'Testaufbau: das Grün liegt neben dem Rot').toEqual(expect.arrayContaining(['Rot', 'Grün']))
    expect(imErstenZug(sichtFuer(zustand, 1)), `K4.2: nach ${JSON.stringify(farben)}`).toBe(true)
  })
})
