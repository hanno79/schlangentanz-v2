import { describe, expect, it } from 'vitest'
import { berechneSpielzustandGesamtwertung, ermittleReaktionsAktionen, starteAusspielphase } from '../engine'
import type { Spielkarte, Spielzustand } from '../engine'
import { pruefeInvarianten } from './invarianten'
import { FestgefahrenFehler, spieleZufaelligBis, starteEntwicklerPartie } from './partie'
import { erzeugeZufall } from './zufall'

function verletzte(zustand: Spielzustand): string[] {
  return pruefeInvarianten(zustand)
    .filter((invariante) => invariante.verletzt)
    .map((invariante) => invariante.name)
}

describe('P0.4: Invarianten am Entwicklertisch', () => {
  it('P0.4: eine frische Partie verletzt keine Invariante', () => {
    expect(pruefeInvarianten(starteEntwicklerPartie(1, 2)).length).toBeGreaterThan(0)
    expect(verletzte(starteEntwicklerPartie(1, 2))).toEqual([])
  })

  it('P0.4: eine doppelt liegende Spielkarte wird gemeldet', () => {
    const zustand = starteEntwicklerPartie(1, 2)
    const karte = zustand.spieler[0].hand[0]
    zustand.spieler[1].hand.push(karte)
    expect(verletzte(zustand)).toContain('Jede Spielkarte liegt genau einmal im Spiel')
    const befund = pruefeInvarianten(zustand).find((i) => i.name === 'Jede Spielkarte liegt genau einmal im Spiel')
    expect(befund?.detail).toContain(karte.id)
  })

  it('P0.4: eine verschwundene Spielkarte wird gemeldet', () => {
    const zustand = starteEntwicklerPartie(1, 2)
    const karte = zustand.nachziehstapel.pop()!
    expect(verletzte(zustand)).toContain('Jede Spielkarte liegt genau einmal im Spiel')
    expect(pruefeInvarianten(zustand).find((i) => i.verletzt)?.detail).toContain(karte.id)
  })

  it('P0.4: eine verschwundene Aufgabenkarte wird gemeldet', () => {
    const zustand = starteEntwicklerPartie(1, 2)
    zustand.aufgabenStapel.pop()
    expect(verletzte(zustand)).toContain('Jede Aufgabenkarte liegt genau einmal im Spiel')
  })

  it('P0.4: ein aktiver Spieler ausserhalb der Spielerliste wird gemeldet', () => {
    const zustand = { ...starteEntwicklerPartie(1, 2), aktiverSpielerIndex: 5 }
    expect(verletzte(zustand)).toContain('Der aktive Spieler existiert')
  })

  it('P0.4: ein Reaktionsfenster ohne mögliche Antwort wird gemeldet', () => {
    const zustand: Spielzustand = {
      ...starteEntwicklerPartie(1, 2),
      pendingReaktion: { typ: 'VerdopplerAbwehr', angreifenderSpielerIndex: 0, verbleibendeSpielerIndizes: [] },
    }
    expect(ermittleReaktionsAktionen(zustand)).toEqual([])
    expect(verletzte(zustand)).toContain('Ein offenes Reaktionsfenster hat eine Antwort')
  })

  it('P0.4: ein Zustand, an dem die Wertung scheitert, wird gemeldet statt zu werfen', () => {
    const zustand = starteEntwicklerPartie(1, 2)
    // Eine Farbenfusion in der Schlange ohne den Eintrag, den die Wertung zu ihr braucht.
    const nimm = (passt: (k: Spielkarte) => boolean) =>
      zustand.nachziehstapel.splice(zustand.nachziehstapel.findIndex(passt), 1)[0]
    const blau = nimm((k) => k.typ === 'Farbkarte' && k.farbe === 'Blau')
    const fusion = nimm((k) => k.typ === 'Sonderkarte' && k.name === 'Farbenfusion')
    zustand.spieler[0].schlangen.push({ id: 'ohne-fusionseintrag', zustand: 'aktiv', karten: [blau, fusion] })
    expect(() => berechneSpielzustandGesamtwertung(zustand)).toThrow()

    const befunde = pruefeInvarianten(zustand)
    const wertung = befunde.find((i) => i.name === 'Die Wertung lässt sich berechnen')
    expect(wertung?.verletzt).toBe(true)
    expect(wertung?.detail).toContain('Die Engine wirft')
  })

  /* Gegenprobe der Invarianten selbst: Würden sie in einer regulär gespielten
     Partie anschlagen, wären sie falsch oder die Engine hätte einen Fehler. Beides
     muss auffallen, bevor jemand am Tisch einem roten Eintrag glaubt.

     Manche Partien bleiben an einer Lage hängen, in der nur die Schlangenhäutung
     ginge; die zählt die heutige Engine nicht auf (`FestgefahrenFehler`, siehe
     `partie.test.ts`). Bis dorthin ist jeder Schritt geprüft; die Untergrenze für
     Partien, die das Spielende erreichen, hält die Prüfung trotzdem gehaltvoll. */
  it('P0.4: in zufällig gespielten Partien bleibt jede Invariante bei jedem Schritt erfüllt', () => {
    let bisZumEnde = 0
    for (let saat = 1; saat <= 15; saat += 1) {
      let schritt = 0
      try {
        spieleZufaelligBis(starteEntwicklerPartie(saat, 2 + (saat % 3)), erzeugeZufall(saat), (zustand) => {
          expect(verletzte(zustand), `Saat ${saat}, Schritt ${schritt}`).toEqual([])
          schritt += 1
          return zustand.zugphase === 'Spielende'
        })
        bisZumEnde += 1
      } catch (fehler) {
        if (!(fehler instanceof FestgefahrenFehler)) throw fehler
      }
    }
    expect(bisZumEnde, 'zu wenige Partien bis zum Spielende').toBeGreaterThanOrEqual(8)
  }, 60_000)

  it('P0.4: der Aufbau einer Ausspielphase verletzt keine Invariante', () => {
    expect(verletzte(starteAusspielphase(starteEntwicklerPartie(9, 4)))).toEqual([])
  })
})
