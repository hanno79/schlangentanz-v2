// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { turnier } from '../turnier'
import type { Teilnehmer } from '../turnier'
import { erstelleSolideKiK2 } from '../__tests__/k2stand/solideKi'
import { erstelleSolideKi } from './solideKi'

/*
K3: Die solide KI ist mit Angriff und Abwehr nicht schwächer als im Stand von K2.
Gemessen wird gegen die feste Abschrift unter `src/ki/__tests__/k2stand/` (nur im
Test, nicht in der Registry), mit festen Saaten. Damit Sitz und Saat nichts
verfälschen, spielt auf denselben Saaten zum Vergleich die K2-Abschrift gegen sich
selbst (Spiegel). Je Partie zählt der Abstand von Teilnehmer 0 zum besten Gegner in
Punkten (A11); verglichen wird Partie für Partie. „Nicht schwächer“ heisst: Der
mittlere Unterschied liegt nicht mehr als zwei Standardfehler unter null, ein
Rückstand wäre also nicht messbar. Den eigentlichen Stärkenachweis macht K5.
*/

const K3: Teilnehmer = { name: 'Solide KI', erstelle: erstelleSolideKi }
const K2: Teilnehmer = { name: 'Solide KI (Stand K2)', erstelle: erstelleSolideKiK2 }

/** Je Partie der Abstand von Teilnehmer 0 zum besten Gegner und ob er gewonnen hat (D22). */
function messe(erster: Teilnehmer, spielerzahl: number, partien: number, ersteSaat: number) {
  const ergebnis = turnier({ teilnehmer: [erster, ...Array.from({ length: spielerzahl - 1 }, () => K2)], partien, ersteSaat, kiSaat: 7_700 + spielerzahl, erweiterung: false })
  for (const partie of ergebnis.partien) expect(partie.ausgang, `K3: Partie ${partie.saat}`).toBe('beendet')
  return { abstaende: ergebnis.partien.map((partie) => partie.punkte[0] - Math.max(...partie.punkte.slice(1))), siege: ergebnis.siege[0] }
}

describe('K3: nicht messbar schwächer als die solide KI im Stand von K2', () => {
  it.each([
    [2, 60, 71_000],
    [4, 30, 72_000],
  ])('K3: %i Spieler, %i Partien ab Saat %i: der Abstand zum besten Gegner liegt Partie für Partie nicht messbar unter dem Spiegel K2 gegen K2', (spielerzahl, partien, ersteSaat) => {
    const neu = messe(K3, spielerzahl, partien, ersteSaat)
    const spiegel = messe(K2, spielerzahl, partien, ersteSaat)
    const unterschiede = neu.abstaende.map((abstand, partie) => abstand - spiegel.abstaende[partie])
    const mittel = unterschiede.reduce((summe, wert) => summe + wert, 0) / partien
    const streuung = Math.sqrt(unterschiede.reduce((summe, wert) => summe + (wert - mittel) ** 2, 0) / (partien - 1))
    const standardfehler = streuung / Math.sqrt(partien)
    const zahlen = `mittlerer Unterschied ${mittel.toFixed(2)} Punkte, Standardfehler ${standardfehler.toFixed(2)}, Siege ${neu.siege} gegen ${spiegel.siege}`
    expect(mittel + 2 * standardfehler, `K3: ${zahlen}`).toBeGreaterThanOrEqual(0)
  }, 900_000)
})
