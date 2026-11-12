import { describe, expect, it } from 'vitest'
import { ermittleReaktionsAktionen, starteAusspielphase } from '../engine'
import type { Spielzustand } from '../engine'
import { pruefeInvarianten } from './invarianten'
import { spieleZufaelligBis, starteEntwicklerPartie } from './partie'
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
    const kaputt = { ...zustand, spieler: [{ ...zustand.spieler[0], schlangen: null }, zustand.spieler[1]] }
    const befunde = pruefeInvarianten(kaputt as unknown as Spielzustand)
    expect(befunde.find((i) => i.name === 'Die Wertung lässt sich berechnen')?.verletzt).toBe(true)
  })

  /* Gegenprobe der Invarianten selbst: Würden sie in einer regulär gespielten
     Partie anschlagen, wären sie falsch oder die Engine hätte einen Fehler. Beides
     muss auffallen, bevor jemand am Tisch einem roten Eintrag glaubt. */
  it('P0.4: in zehn zufällig gespielten Partien bleibt jede Invariante bei jedem Schritt erfüllt', () => {
    for (let saat = 1; saat <= 10; saat += 1) {
      let schritt = 0
      const ende = spieleZufaelligBis(starteEntwicklerPartie(saat, 2 + (saat % 3)), erzeugeZufall(saat), (zustand) => {
        expect(verletzte(zustand), `Saat ${saat}, Schritt ${schritt}`).toEqual([])
        schritt += 1
        return zustand.zugphase === 'Spielende'
      })
      expect(ende.zugphase, `Saat ${saat}`).toBe('Spielende')
    }
  }, 60_000)

  it('P0.4: der Aufbau einer Ausspielphase verletzt keine Invariante', () => {
    expect(verletzte(starteAusspielphase(starteEntwicklerPartie(9, 4)))).toEqual([])
  })
})
