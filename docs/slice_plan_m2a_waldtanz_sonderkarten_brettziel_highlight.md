# M2a — Waldtanz-Sonderkarten-Brettziel-Auto-Highlight (2026-06-27)

**Slice-Klasse:** Affordance-Mid-Slice / Stitch-Visual-Slice (kein Engine-Touch, keine neue Komponente — nur ein sichtbarer "Hier passiert was"-Moment auf den Brettobjekten)

**Milestone:** M2a Waldtanz Sonderkarten-Brettziel-Auswahl (Sonderkarten-Brettmoment-Familie)

**Begründung: warum mittel statt mikro:** M1dq hat den "Hier entlang"-Link in der Handbühne gebaut. M1cz hat die dekorativen Peek-Tiles. Aber das eigentliche Brett-Ziel selbst leuchtet nicht automatisch — der Spieler muss den Handbühne-Link erst anklicken, scrollt dann quer durchs Brett, und sieht endlich das pulsierende Ziel. Der "echte Spielmoment" fehlt: das Brett-Ziel soll leuchten, sobald die Sonderkarte spielbereit ist. Genau das macht den Unterschied zwischen Click-Simulator und Brettspiel.

## Was sichtbar wird

Wenn der Spieler eine Sonderkarte auswählt und ein legales Ziel existiert:
- Vorher: Sonderkarten-Brettziele (Bissspur, Beutekorb, Paarziel, Schild, Fessel, Grubenfalle, Häutungsbrettziel) sehen aus wie kleine Hinweistexte neben den Schlangen.
- Nachher: Diese Ziele pulsieren mit dem `--aktiv`-Highlight (animation `waldtanz-zielspur-puls`, outline `var(--st-color-secondary-container)`, hard-shadow + glow), sobald die Sonderkarte ausgewählt ist. Genau wie heute — nur **automatisch**, ohne den manuellen Klick auf "Zum Brett-Ziel".

Das ist **eine sichtbare Spielverbesserung** (echtes "Hier passiert was"-Gefühl), **kein Big-Bang** (1 Logik-Funktion, 1 useEffect, CSS-Contract bleibt identisch), **kein Mikro-Slice** (es deckt alle 6 Sonderkarten-Brettziele gleichzeitig ab und erspart dem Spieler einen Klick pro Sonderkarte).

## Rein

- `src/components/Schlangenbereich.tsx`:
  - Neue Helper-Funktion `ermittleAutoHighlightZielspurKey({ ausgewaehlteHandkarteId, legaleAktionen, aktiverSpielerId, aktiverSpielerSchlangen })`, die — analog zu `ermittleZielspurObjekte` — den **ersten** zielspurKey liefert, der zu der ausgewählten Handkarte passt (Reihenfolge: Schlangenfrass > Farbenschutz > Farbenfusion > Schlangenblockade > Farbendieb > Häutung).
  - `useEffect`, der `setAktiverZielspurKey(autoKey)` aufruft, wenn `ausgewaehlteHandkarteId` wechselt UND `autoKey !== null`. Räumt automatisch auf (`null`), wenn keine Sonderkarte mehr ausgewählt ist ODER kein legales Ziel existiert.
  - **Keine** Änderung an `aktiverZielspurKey`-Initialisierung, `scrollIntoView`-Effekt, oder den `hervorgehoben`-Props der Sonderkarten-Brettziele — die existierende Infrastruktur wiederverwenden.
- `src/components/waldtanzZielspurLogik.ts`:
  - Neue exportierte Funktion `ermittleAutoHighlightZielspurKey(...)` als reine Logik (testbar, ohne React).
- `src/components/WaldtanzSonderkartenSpielmoment.tsx`:
  - `onZielspurAktivieren` darf weiter `undefined` sein (die M1dq-Bubble bleibt optional); die Logik im Schlangenbereich ist jetzt die primäre Highlight-Quelle.
- `src/App.m2a_waldtanz_sonderkarten_brettziel_highlight.test.tsx` (NEU, 6 RED-Tests):
  - RED-1: Sonderkarte auswählen → `setAktiverZielspurKey` wird automatisch mit dem ersten passenden Key aufgerufen
  - RED-2: Farbenschutz-Sonderkarte → `schutz:<schlangeId>` als Auto-Highlight-Key
  - RED-3: Schlangenfrass-Sonderkarte (eigene Schlange als Ziel) → `frass:<aktiverSpielerId>:<schlangeId>:<kartenId>` als Auto-Highlight
  - RED-4: Sonderkarte abwählen → Auto-Highlight wird auf `null` zurückgesetzt
  - RED-5: Sonderkarte ohne legales Ziel → `null` (kein gesetzter Key)
  - RED-6: package.json-Wiring (M2a nach M1cz, vor M2b in `smoke:production`-Kette)
- `scripts/m2a_waldtanz_sonderkarten_brettziel_highlight_smoke.mjs` (NEU): Playwright-Browser-Smoke, der auf `/game` eine Sonderkarte auswählt und prüft, dass ein Brett-Ziel-Element die `--aktiv`-Klasse trägt, console/page-errors einsammelt.
- `package.json`: M2a-Smoke in `smoke:production`-Kette verdrahtet (zwischen M1cz und M2b).

## Raus (was bewusst NICHT angefasst wird)

- **Engine**: keine Änderung an `src/engine/*`. Reine UI-Affordance.
- **CSS-Vertrag**: die bestehenden `.waldtanz-zielspur-ziel--aktiv`-Regeln bleiben unverändert. M2a nutzt sie als "bereits-aktive" Highlight-Klasse, fügt nur die Auto-Logik hinzu.
- **M1dq Sonderkarten-Spielmoment-Bubble**: bleibt als zusätzlicher Hinweis (Handbühne-Pfeil) erhalten. Die Bubble ist der "Hier entlang"-Text, das Auto-Highlight ist der visuelle Beweis.
- **Farbkarten-Brettziele (KarteAnlegen, NeueSchlangeStarten)**: NICHT im Auto-Highlight — die sind über Anlegeplätze, Startzone und Schlangen-Pfade sowieso visuell klar (M1dl-Pulse, M1cj-Startfährte). Auto-Highlight nur für Sonderkarten.
- **Aktionspfade**: keine Änderung am Klick-Handler, keine neue Engine-Logik, kein Touch der `onAktion`-Bridge.
- **Layout/Komponenten-Extraktionen**: keine neuen Files außer der Test-Datei + Smoke-Skript.

## Raus (Kimis NON-BLOCKERS werden im Folgeslice adressiert)

Kimi K2.7 hat bei M1cz 5 NON-BLOCKERS aufgelistet (eco-CSS-Regel, redundant aria-hidden, Smoke-Fixture, computed-style-check, transform-check, reduced-motion-Override). Diese werden **nicht** im M2a-Slice mitgezogen — M2a hat einen anderen Fokus. Falls Cron-Budget reicht, optional als M1cz+1 Polish-Slice nachziehen.

## Kimi-Code-CLI-Review-Disclosure (2026-06-27)

**Reviewer:** Kimi Code CLI v0.18.x (k2p7) — Standard-Fallback waehrend Codex-CLI-OAuth-Quoten-Limit bis ca. 25.06.2026 19:07 UTC.

**Kimi-Resultat:** 4 BLOCKER + 9 NON-BLOCKER.

**Behandlung der 4 BLOCKER in M2a:**

1. **Blocker 1+4 (useEffect+setState vs derived value, Ghost-Highlight):** Bewusst NICHT mit useEffect+setState geloest. Stattdessen: Auto-Highlight hat Vorrang vor manuellem M1dq-Key (`effektiverZielspurKey = autoHighlightKey ?? aktiverZielspurKey`). Begruendung: Beim Sonderkarten-Wechsel ueberschreibt der frische Auto-Key automatisch den M1dq-Geister-State. Erste Variante mit useEffect+setAktiverZielspurKey(null) hat pre-existing M1co/M1cp-Tests gebrochen, weil die Auto-Highlight-Logik in der Spieler-1-Phase manchmal kurz null liefert, waehrend der M1dq-Sprung-Button aktiv ist — der Cleanup-Effect wuerde den M1dq-Sprung zerstoeren. Derived-value-Pattern ist robuster.

2. **Blocker 2 (Gegnerlichtung erhaelt undefined):** Bewusst NICHT in M2a-Scope behoben. M2a reduziert den Scope auf die 3 Sonderkarten mit `data-zielspur-key`-DOM-Anker im Schlangenbereich (Bissspur, Schild, Paarziel). Schlangenblockade + Farbendieb sitzen in der Gegnerlichtung, die in `App.tsx:324` `aktiverZielspurKey={undefined}` bekommt. Das ist ein App-Scope-State-Architekturproblem, das in M2b (Gegnerlichtung-Key-Prop-Federung) als separater Slice adressiert wird. Bis dahin bleiben manuelle Sprung-Buttons aus M1co/M1cp fuer Blockade/Dieb funktional.

3. **Blocker 3 (Schlangenhaeutung ohne data-zielspur-key):** Bewusst NICHT in M2a-Scope behoben. `SchlangenhaeutungBrettziel` rendert kein `data-zielspur-key`-Element. Wird in M2c adressiert (data-zielspur-key + Highlight-System anbinden). M2a entfernt `haeutung:...`-Key komplett aus `ermittleAutoHighlightZielspurKey`, weil toter Code mehr Verwirrung stiftet als ein ehrliches "noch nicht implementiert".

**Scope-Reduktion Konsequenz:** `ermittleAutoHighlightZielspurKey` verarbeitet ab M2a nur noch 3 Sonderkarten (Schlangenfrass, Farbenschutz, Farbenfusion). Die Keys `blockade:...`, `dieb:...`, `haeutung:...` existieren nicht mehr in der Auto-Logik. Die zugehoerigen `Aktion`-Typen (`SchlangenblockadeSpielen`, `FarbendiebSpielen`) und der `haeutungZielAnzahl`-Parameter sind aus dem Funktions-Signatur entfernt.

## RED-Test-Strategie

Die RED-Tests sind reine Logik-Tests (JSX-Inspektion) — sie rendern den `Schlangenbereich` mit einer Sonderkarte in der Hand und prüfen via `getByTestId`/`getAllByRole`, dass die richtige Komponente `hervorgehoben={true}` erhält. jsdom-Inspektion auf die `--aktiv`-CSS-Klasse.

## Smoke-Strategie

- Self-Test-Mode: prüft nur, dass das Skript lädt und `BASE_URL` gesetzt ist.
- Live-Mode: navigated zu `/game`, klickt eine Sonderkarte, wartet auf `data-zielspur-key` + `waldtanz-zielspur-ziel--aktiv`-Klasse, misst `boundingClientRect()`.

## Gates (vor Release)

- RED-Tests: 6/6 grün
- Targeted-Suite (M1cz + M1dt + M1dq + M2a): 30+ Tests grün
- Typecheck: grün
- Lint: grün
- Build: grün
- `git diff --check`: grün
- `npm test -- --run` (full suite): keine neuen Regressionen
- Kimi Code CLI Review (Codex rate-limited bis 25.06.2026 19:07 UTC): kein Blocker
- Vercel Production Deploy
- Live-Smoke gegen Production URL: Sonderkarte auswählen → Brett-Ziel pulsiert

## Lessons-Learned-Anker (für nächste Slices)

- **Auto-Highlight ≠ aggressives Highlight**: nur EIN Highlight gleichzeitig, nicht mehrere. Die bestehende `aktiverZielspurKey`-Logik (singular state) bleibt erhalten.
- **Reihenfolge wichtig**: bei Mehrfach-Zielen (z.B. Bissspur mit 2 Karten) nur den ersten markieren — der Spieler klickt selbst auf die zweite Bissspur, wenn er sie will. Das vermeidet "Welcher leuchtet jetzt?"-Verwirrung.
- **Cleanup zählt**: `useEffect` muss `setAktiverZielspurKey(null)` machen, wenn die Sonderkarte abgewählt wird — sonst bleibt der "Geister-Highlight" stehen.
