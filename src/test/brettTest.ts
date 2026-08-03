/*
Author: Claude Code
Datum: 03.08.2026
Version: 1.1
Beschreibung: Gemeinsame Hilfen der Brett- und Zustandstests.

Präzedenz: `src/engine/__tests__/testHelpers.ts` für die Engine-Tests,
`src/test/smokeKetten.ts` für die Smoke-Ketten.

**ÄNDERUNG [03.08.2026]:** Die erste Fassung behauptete, `partie()` stehe „in
vier Fassungen da, und das zu Recht". Nachgezählt: Vier sind **byte-gleich**
(`Spielbrett.status`, `Spielbrett.fehler`, `usePartie.fehler`, `spielstand`), und
nur zwei unterscheiden sich wirklich — `Spielbrett.integration` braucht zwei
Spieler mit festem Seed, `Spielbrett.brettziele` zusätzlich einen
Aufbau-Callback. Die vier identischen liegen jetzt hier, die zwei anderen
bleiben, wo sie sind.
*/

import { erstelleEinzelspielerSpielzustand, starteAusspielphase } from '../engine'
import type { Spielzustand } from '../engine'

/* `src/test/**` gehört zu `tsconfig.test.json`, das von `tsconfig.node.json`
   erbt und deshalb keine DOM-Typen kennt. `setup.ts` deklariert `window` aus
   demselben Grund selbst — hier dasselbe Muster, statt die Projektaufteilung
   für drei Zeilen umzubauen. */
declare const window: {
  history: { pushState: (data: unknown, unused: string, url?: string | null) => void }
}

/**
 * Setzt die Route auf `/game`, damit `App` das Brett rendert statt der Lobby.
 *
 * Zurückgesetzt wird global in `src/test/setup.ts` — deshalb braucht keine
 * Testdatei ein eigenes `afterEach` dafür.
 */
export function aufBrettRoute(): void {
  window.history.pushState({}, '', '/game')
}

/** Eine frische Partie: ein Mensch, ein KI-Gegner, bereit zum Ausspielen. */
export function einzelspielerPartie(): Spielzustand {
  return starteAusspielphase(erstelleEinzelspielerSpielzustand(1))
}
