/*
Author: Claude Code
Datum: 03.08.2026
Version: 1.0
Beschreibung: Gemeinsame Hilfen der Brett-Tests.

Präzedenz: `src/engine/__tests__/testHelpers.ts` für die Engine-Tests,
`src/test/smokeKetten.ts` für die Smoke-Ketten.

**Bewusst nur `aufBrettRoute`.** Der Simplify-Durchgang hatte auch `partie()`
genannt — die Funktion steht aber in vier Fassungen da, und das zu Recht:
`Spielbrett.status` und `.fehler` brauchen einen Einzelspieler-Zustand,
`.integration` zwei Spieler mit festem Seed, `.brettziele` zusätzlich einen
Aufbau-Callback. Sie zusammenzuziehen hieße, vier verschiedene Testabsichten in
eine Signatur mit Schaltern zu pressen. Nur `aufBrettRoute` ist wortgleich
sechsmal vorhanden — und nur das ist eine Doppelung.
*/

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
