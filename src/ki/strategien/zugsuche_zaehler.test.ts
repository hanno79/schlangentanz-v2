// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ermittleAktionen, erzeugeZufall } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import type { Schlangenglied } from '../../engine/testing/szenario'
import { sichtFuer } from '../sicht'
import { bewerte } from './bewertung'
import { planeZug } from './zugsuche'

/*
K2, Kriterium 8 (Prüfprotokoll K2, Iteration 2, Mangel 1, und Codex-Review dazu):
Die Zähler im Zugplan müssen stimmen. Dieser Test zählt die Aufrufe von `bewerte`
selbst, unabhängig von dem, was die Zugsuche meldet. Seit K4 kommen die Schätzungen
für Risiko-Karten und verdecktes Ziehen dazu (`schaetzung`, Plan K4, Kriterium 4).
*/

// Die Bewertung bleibt echt; gezählt wird nur, wie oft sie läuft.
vi.mock('./bewertung', async (original) => {
  const modul = await original<typeof import('./bewertung')>()
  return { ...modul, bewerte: vi.fn(modul.bewerte) }
})

afterEach(() => vi.mocked(bewerte).mockClear())

function bunteSchlange(anzahl: number, versatz: number): Schlangenglied[] {
  const farben = ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun'] as const
  return Array.from({ length: anzahl }, (_, stelle) => farben[(Math.floor(stelle / 2) + versatz) % farben.length])
}

describe('K2.8: die Zähler der Zugsuche stimmen mit den echten Aufrufen von bewerte überein', () => {
  it('K2.8: späte Stellung mit über tausend Aktionen: Suche und Vorauswahl zusammen sind genau die Aufrufe von bewerte, die Suche höchstens 64', () => {
    const bau = baukasten({ spielerzahl: 3, erweiterung: false, zufall: erzeugeZufall(91) })
    for (const [spieler, versatz] of [[0, 0], [0, 1], [1, 2], [1, 3], [2, 4], [2, 0]] as const) bau.schlange(spieler, bunteSchlange(9, versatz))
    const zustand = bau.hand(1, ['Farbendieb', 'Schlangenfrass', 'Regenbogenschlange', 'Schlangenblockade', 'Grün']).haendeAuffuellen().amZug(1).zustand()
    const sicht = sichtFuer(zustand, 1)
    vi.mocked(bewerte).mockClear()

    const plan = planeZug(sicht, ermittleAktionen(zustand), erzeugeZufall(1))
    const echt = vi.mocked(bewerte).mock.calls.length
    expect(plan.bewertungen.suche + plan.bewertungen.vorauswahl + plan.bewertungen.schaetzung, 'K2.8: gemeldet gegen gezählt').toBe(echt)
    expect(plan.bewertungen.suche, 'K2.8: durchgerechnete Stellungen').toBeLessThanOrEqual(64)
    expect(plan.bewertungen.vorauswahl, 'K2.8: Bewertungen in der Vorauswahl').toBeLessThanOrEqual(plan.bewertungen.angeboten)
    expect(echt, 'K2.8: Testaufbau, die Vorauswahl lief über die vielen Aktionen').toBeGreaterThan(1000)
  })

  it('K2.8: auch in einem frühen Zug mit wenigen Aktionen stimmen die Zähler', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(92) }).haendeAuffuellen().amZug(1).zustand()
    vi.mocked(bewerte).mockClear()
    const plan = planeZug(sichtFuer(zustand, 1), ermittleAktionen(zustand), erzeugeZufall(2))
    expect(plan.bewertungen.suche + plan.bewertungen.vorauswahl + plan.bewertungen.schaetzung).toBe(vi.mocked(bewerte).mock.calls.length)
  })

  it('K4.4, K2.8: mit Erweiterung, Risiko-Karten in der Auslage und dem Schlangenkorb auf der Hand: Suche, Vorauswahl und Schätzungen sind genau die Aufrufe von bewerte, die Suche höchstens 64', () => {
    const zustand = baukasten({ spielerzahl: 3, erweiterung: true, zufall: erzeugeZufall(93) })
      .schlange(1, ['Blau', 'Blau', 'Rot', 'Blau', 'Gelb', 'Gelb'])
      .schlange(0, bunteSchlange(8, 1))
      .hand(1, ['Schlangenkorb des Glücks', 'Blau', 'Gelb', 'Rot', 'Farbenschutz'])
      .haendeAuffuellen()
      .amZug(1)
      .zugbeginn()
      .zustand()
    for (const saat of [1, 2, 3]) {
      vi.mocked(bewerte).mockClear()
      const plan = planeZug(sichtFuer(zustand, 1), ermittleAktionen(zustand), erzeugeZufall(saat))
      const { suche, vorauswahl, schaetzung } = plan.bewertungen
      expect(suche + vorauswahl + schaetzung, `K2.8: gemeldet gegen gezählt, Saat ${saat}`).toBe(vi.mocked(bewerte).mock.calls.length)
      expect(schaetzung, 'Testaufbau: die Risiko-Karten wurden geschätzt').toBeGreaterThan(0)
      expect(suche, 'K2.8: durchgerechnete Stellungen').toBeLessThanOrEqual(64)
    }
  })
})
