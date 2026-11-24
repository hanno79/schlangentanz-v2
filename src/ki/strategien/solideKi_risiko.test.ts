// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider, erzeugeZufall } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { kiWahl } from '../schritt'
import { spielePartie } from '../turnier'
import { erstelleSolideKi } from './solideKi'
import { erstelleZufallsKi } from './zufallsKi'

/*
X5: Die KI muss Risiko-Karten noch nicht klug nutzen (K4), darf aber an
keiner Risiko-Entscheidung scheitern: weder als Spieler am Zug noch als
begünstigter Gegner (D52, D54). Zufalls-KI und solide KI spielen Partien mit
Erweiterung zu Ende und setzen dabei Risiko-Karten ein.
*/

function spiele(zustand: Spielzustand, passt: (aktion: SpielAktion) => boolean): Spielzustand {
  const aktion = ermittleAktionen(zustand).find(passt)
  if (aktion === undefined) throw new Error(`Testaufbau: keine passende Aktion unter ${JSON.stringify(ermittleAktionen(zustand))}`)
  return anwendeAktion(zustand, aktion).zustand
}

const risiko = (nummer: number) => (aktion: SpielAktion) => aktion.typ === 'RisikoKarteSpielen' && aktion.risikoAktion === nummer
const wahl = (text: string) => (aktion: SpielAktion) => aktion.typ === 'Entscheiden' && aktion.wahl === text

/** Drei Spieler; Spieler 1 hält Rot und Blau, hat die Schlange Gelb, Braun und auf dem Ablagestapel einen Farbendieb; oben liegt `oben`. */
function tisch(oben: 'Grün' | 'Schlangenfrass' | 'Violett' | 'Gelb'): Spielzustand {
  return baukasten({ spielerzahl: 3, erweiterung: true, zufall: erzeugeZufall(51) })
    .hand(0, ['Rot', 'Blau'])
    .schlange(0, ['Gelb', 'Braun'])
    .ablage(0, ['Farbendieb'])
    .ablage(1, ['Verdoppler'])
    .haendeAuffuellen()
    .stapelOben([oben])
    .zustand()
}

/** Jede Art von Risiko-Entscheidung, einmal offen. */
function offeneEntscheidungen(): Spielzustand[] {
  const zweiteVerloren = spiele(tisch('Schlangenfrass'), risiko(2))
  const vierteVerloren = spiele(tisch('Schlangenfrass'), risiko(4))
  return [
    spiele(tisch('Schlangenfrass'), risiko(1)),
    spiele(tisch('Grün'), risiko(2)),
    zweiteVerloren,
    spiele(zweiteVerloren, wahl('spieler-2')),
    spiele(tisch('Gelb'), risiko(3)),
    spiele(tisch('Violett'), risiko(3)),
    spiele(tisch('Grün'), risiko(4)),
    spiele(vierteVerloren, wahl('spieler-2')),
  ]
}

describe('X5/K4-Vorstufe: die KI an Risiko-Entscheidungen', () => {
  it('A8.2/D52/D54: die solide KI wählt bei jeder Risiko-Entscheidung eine aufgezählte Wahl, auch als begünstigter Gegner', () => {
    const stellungen = offeneEntscheidungen()
    expect(stellungen.map((zustand) => ermittleEntscheider(zustand))).toEqual([0, 0, 0, 1, 0, 0, 0, 1])
    for (const [nummer, zustand] of stellungen.entries()) {
      expect(zustand.entscheidung?.art, `Testaufbau: Stellung ${nummer}`).toMatch(/^Risiko/)
      const gewaehlt = kiWahl(zustand, erstelleSolideKi(erzeugeZufall(nummer + 1)))
      expect(ermittleAktionen(zustand), `solide KI, Stellung ${nummer}`).toContainEqual(gewaehlt)
      expect(() => anwendeAktion(zustand, gewaehlt!)).not.toThrow()
    }
  }, 60_000)

  it('A8.2: die Zufalls-KI setzt in Partien mit Erweiterung Risiko-Karten ein und spielt sie zu Ende', () => {
    let gespielt = 0
    for (const saat of [61, 62, 63]) {
      const start = baukasten({ spielerzahl: 2 + (saat % 3), erweiterung: true, zufall: erzeugeZufall(saat) }).haendeAuffuellen().zustand()
      const kis = start.spieler.map((_, sitz) => erstelleZufallsKi(erzeugeZufall(saat * 10 + sitz)))
      const verlauf = spielePartie(start, kis)
      expect(verlauf.ausgang, `Saat ${saat}: ${verlauf.detail}`).toBe('beendet')
      gespielt += verlauf.verlauf.filter((aktion) => aktion.typ === 'RisikoKarteSpielen').length
    }
    expect(gespielt, 'A8.2: Risiko-Karten in den Partien').toBeGreaterThan(0)
  }, 60_000)

  it('A8.2: die solide KI spielt eine Partie mit Erweiterung gegen die Zufalls-KI zu Ende, ohne an Risiko-Karten zu scheitern', () => {
    const start = baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(71) }).haendeAuffuellen().zustand()
    const verlauf = spielePartie(start, [erstelleSolideKi(erzeugeZufall(72)), erstelleZufallsKi(erzeugeZufall(73))])
    expect(verlauf.ausgang, verlauf.detail).toBe('beendet')
    expect(verlauf.verlauf.filter((aktion) => aktion.typ === 'RisikoKarteSpielen').length, 'A8.2: Risiko-Karten in der Partie').toBeGreaterThan(0)
  }, 120_000)
})
