/*
Author: Claude Code (Etappe 5)
Datum: 04.08.2026
Version: 1.0
Beschreibung: Fehlermeldungen nach außen — die eine Stelle, an der Sentry vorkommt.

**Warum es das braucht.** `Fehlerfang.tsx` schrieb bis heute `console.error`, und
das erreicht niemanden. Schlimmer: Der Fang sieht nur **Render**-Fehler.
Unbehandelte Promise-Rejections und Fehler in Ereignis-Handlern gingen gar nicht
durch ihn. Bei einer Engine, die an rund 220 Stellen wirft, war das die größte
blinde Stelle im Betrieb — ein Spieler sah eine Meldung, und niemand sonst erfuhr
davon.

**Warum `@sentry/browser` und nicht `@sentry/react`.** Gebraucht werden genau zwei
Funktionen: `init` und `captureException`. Was `@sentry/react` darüber hinaus
mitbringt, sind Wrapper um React-Bausteine — eine eigene `ErrorBoundary`, ein
Profiler —, und die eigene `ErrorBoundary` gibt es hier schon
(`src/components/Fehlerfang.tsx`, mit einem Grund dokumentiert). Gemessen wurde die
Bundle-Differenz beider Pakete, siehe `docs/PLAYABILITY_GATE.md`.

**Warum diese Datei.** Sentry steht nur hier, nach dem Vorbild von
`testPhaseHook.ts` mit `testHooksAktiv()`: eine Bedingung, eine Stelle, prüfbar
per Test. `src/sentry_produktion.test.ts` hält fest, dass es dabei bleibt.

**Der Schalter ist die DSN.** Ohne `VITE_SENTRY_DSN` passiert nichts — kein
Netzwerkverkehr, keine Initialisierung. Das ist dieselbe Trennung wie bei
`VITE_TEST_HOOKS`: Tests, Dev-Läufe und die Layout-Verträge dürfen nichts nach
außen senden, und zwar nicht aus Höflichkeit, sondern weil ein Testlauf sonst
echte Fehlerberichte erzeugt, die niemand von echten unterscheiden kann.
*/

/*
**Warum nachgeladen und nicht importiert.** Gemessen: Ein statischer Import von
`@sentry/browser` ließ das Bundle von 87.692 auf 116.568 Byte gzip wachsen —
**+32,6 %** für ein Werkzeug, das im Normalfall nichts tut. Das steht im
kritischen Pfad des Spielers, der auf das Brett wartet.

Mit `await import(...)` wird daraus ein eigener Chunk, den nur lädt, wer eine DSN
hat. In Dev und im Testlauf wird er nie angefordert.

Der Preis dieser Entscheidung ist ein Zeitfenster: Zwischen dem ersten Zeichnen und
dem Ende des Nachladens ist der Dienst noch nicht bereit. Fehler aus dieser Zeit
sind aber die interessantesten — ein Wurf beim Aufbau des Bretts —, deshalb werden
sie gepuffert und nachgereicht, statt verloren zu gehen.
*/
type SentryModul = typeof import('@sentry/browser')

let sentry: SentryModul | null = null
const wartendeFehler: { fehler: unknown; zusatz?: Record<string, string> }[] = []

/** Die DSN aus der Umgebung — gesetzt ausschließlich im Vercel-Projekt. */
function dsn(): string {
  const wert = import.meta.env.VITE_SENTRY_DSN
  return typeof wert === 'string' ? wert.trim() : ''
}

/**
 * Ist der Fehlerdienst scharf? Nur mit gesetzter DSN.
 *
 * Bewusst eine Funktion und kein zur Ladezeit ausgewerteter Wert: So kann ein
 * Test die Umgebung stellen, ohne das Modul neu laden zu müssen.
 */
export function fehlerdienstAktiv(): boolean {
  return dsn() !== ''
}

/**
 * Startet den Fehlerdienst, falls eine DSN vorliegt.
 *
 * `tracesSampleRate: 0` und `sendDefaultPii: false` sind keine Vorsichtsformeln:
 * Es geht um Fehler, nicht um Telemetrie. Ohne Performance-Tracing bleibt weniger
 * im Bundle, und ohne PII gibt es keine Frage, was da eigentlich übertragen wird.
 */
export async function starteFehlerdienst(): Promise<void> {
  if (!fehlerdienstAktiv()) return
  try {
    sentry = await import('@sentry/browser')
  } catch (ladefehler) {
    /* Der Fehlerdienst darf die App nicht mitnehmen. Schlägt das Nachladen fehl
       (blockiert, offline, Chunk fehlt), bleibt es beim `console.error` im
       Fehlerfang — schlechter als Sentry, aber besser als eine weiße Seite. */
    console.error('Fehlerdienst konnte nicht geladen werden:', ladefehler)
    return
  }
  sentry.init({
    dsn: dsn(),
    sendDefaultPii: false,
    tracesSampleRate: 0,
    // Ohne Angabe stünde in Sentry bei jedem Fehler „production“, auch für Previews.
    environment: import.meta.env.MODE,
  })
  // Was während des Nachladens auflief, jetzt nachreichen.
  while (wartendeFehler.length > 0) {
    const eintrag = wartendeFehler.shift()
    if (eintrag !== undefined) sende(eintrag.fehler, eintrag.zusatz)
  }
}

function sende(fehler: unknown, zusatz?: Record<string, string>): void {
  sentry?.captureException(fehler, zusatz === undefined ? undefined : { extra: zusatz })
}

/**
 * Meldet einen Fehler — still, wenn der Dienst aus ist.
 *
 * Der Aufrufer muss nicht wissen, ob eine DSN gesetzt ist oder ob das Modul schon
 * geladen wurde; sonst stünden diese Bedingungen an jeder Aufrufstelle noch einmal.
 */
export function meldeFehler(fehler: unknown, zusatz?: Record<string, string>): void {
  if (!fehlerdienstAktiv()) return
  if (sentry === null) {
    /* Deckel gegen unbegrenztes Wachsen: Wenn hundert Fehler auflaufen, bevor der
       Chunk da ist, hilft der hundertunderste nicht weiter. */
    if (wartendeFehler.length < 20) wartendeFehler.push({ fehler, zusatz })
    return
  }
  sende(fehler, zusatz)
}
