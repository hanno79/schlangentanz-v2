/*
Author: Claude Code
Datum: 04.08.2026
Version: 1.0
Beschreibung: Route öffnen samt Vorbedingung — der Ersatz für `waitUntil: 'networkidle'`.

**Warum kein `networkidle`.** Playwright stuft die Option ausdrücklich als
abgeraten ein und verweist auf Web-Assertions. Hier wartet sie zudem auf nichts:
Die App lädt kein `@font-face`, keine Google-Fonts (nur ein System-Stack), kein
`url()` aus `src/App.css`, kein `<img>` und keine data-URI. Es gibt keine
Ressource, deren Ankunft die Geometrie noch verschieben könnte. Der Preis war
dagegen real — bei `retries: 0` ist ein Hänger im gemeinsamen `beforeEach` ein
harter Fehlschlag für alle Verträge der Datei, ohne Wiederholung.

**Warum sie nicht einfach entfallen kann.** Ein nacktes `page.goto()` wäre der
schlechtere Tausch, denn die meisten Verträge messen *direkt* nach dem Öffnen,
ohne selbst eine Bereitschaftsprüfung zu stellen. Auf einer noch leeren Seite
messen sie dann nichts und bleiben **grün**:

- `#root` steht als leeres `<div>` schon im ausgelieferten HTML — es ist auch
  ohne gerenderte App 1280 px breit und beginnt bei x=0. Der Rahmenvertrag wäre
  erfüllt, bevor die App existiert.
- `toBeHidden()` ist für ein Element erfüllt, das es überhaupt nicht gibt. Die
  Verträge „blendet den Spielbereich aus" und „blendet das Schlangenbuch aus"
  hielten auf einer leeren Seite.
- Die generischen Wächter fragen die *ganze* Seite ab. Wo nichts steht, ist auch
  nichts abgeschnitten, verdeckt oder außerhalb des Bildes — vier grüne Wächter
  über einer weißen Fläche.

Das ist dieselbe Fehlerklasse, die am 03.08.2026 bei der Sieger-Party gemessen
wurde: Fünf von acht Verträgen blieben gegen den Produktionsbuild grün, obwohl es
dort gar keine Sieger-Party gibt. Die Antwort war damals eine ausdrückliche
Vorbedingung im `beforeEach` — und dieselbe Antwort gilt hier.

Deshalb ersetzt `oeffne()` das Warten durch eine **benannte Erwartung**: Diese
Route hat dieses Leitelement aufgebaut, sonst misst der Vertrag nichts.
*/

import { expect, type Page } from '@playwright/test'

/*
Leitelement je Route: das Element, dessen Sichtbarkeit belegt, dass dieser
Bildschirm wirklich da ist.

Absichtlich als Tabelle und nicht als optionales Argument: Eine neue Route ohne
Leitelement soll auffallen, statt still auf ein nacktes `goto` zurückzufallen.
Deshalb wirft `oeffne()` unten, statt die Prüfung zu überspringen.
*/
const LEITELEMENT: Record<string, string> = {
  '/': '.sonniges-nest',
  '/game': '.spielbrett',
}

/**
 * Öffnet `route` und wartet, bis deren Leitelement sichtbar ist.
 *
 * Nicht verwenden, wenn der Vertrag *selbst* behauptet, dass dieses Leitelement
 * erscheint — dann wanderte seine Aussage in die Vorbedingung, und er könnte sie
 * nicht mehr prüfen. Solche Verträge stellen ihre Erwartung weiter selbst
 * (`lobby_erstbild.spec.ts`, „zeigt das Spielbrett und nicht die Lobby").
 */
export async function oeffne(page: Page, route: string): Promise<void> {
  const leitelement = LEITELEMENT[route]
  if (leitelement === undefined) {
    throw new Error(
      `Keine Vorbedingung für Route "${route}" hinterlegt. ` +
        `Leitelement in LEITELEMENT (tests/layout/oeffnen.ts) ergänzen.`,
    )
  }
  await page.goto(route)
  await expect(
    page.locator(leitelement),
    `Route ${route} hat ${leitelement} nicht aufgebaut — dieser Vertrag misst nichts.`,
  ).toBeVisible()
}
