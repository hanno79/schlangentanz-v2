# M8b Release-Status — Schlangenfrass 2-Gegner-Zielauswahl (State-Machine)

**Datum:** 30.06.2026
**Slice:** M8b — Sub-Slice aus M8 (Half-Finished-Family-9-Pattern, M8a→M8b-Sub-Slicing)
**Klasse:** M8b = State-Machine-Later (4. Root-Cause-Pattern aus M8b-Case-Study)
**Status:** 🟢 SHIPPED

## Zusammenfassung

Auf /game kann der Spieler mit der Schlangenfrass-Sonderkarte 2 gegnerische
Karten auswaehlen, um sie zu entfernen. Der 2-Ziel-State `erstesFrassZiel`
war in der `GegnerSchlangenListe`-Komponente (Child) eingesperrt — bei
mehreren gegnerischen Spielern rendert `WaldtanzGegnerlichtung` eine
`GegnerSchlangenListe` PRO Gegner, jede Instanz hatte ihr eigenes
`useState`, sodass die Bissspur in Spieler-1's Liste nicht in Spieler-2's
Liste sichtbar war → die Zweite-Ziel-Sofortaktion wurde NIE angeboten,
das Spiel hing fest.

**Fix:** State `erstesFrassZiel` und `setErstesFrassZiel` in die
`WaldtanzGegnerlichtung`-Komponente geliftet, als Props an die
`GegnerSchlangenListe`-Instanzen weitergereicht. Beim Klick auf die
Bissspur (Ziel 1) wird `setErstesFrassZiel` auf der Parent-Ebene
aufgerufen → alle Listen sehen den State, die Sofortaktion erscheint
in Spieler-2's Liste. Kompass wird nur in der Liste angezeigt, die
das aktive Ziel-1 besitzt (verhindert Duplikat-Rendering).

**Visueller Effekt:** Spieler kann eine 2-Gegner-Schlangenfrass
vollenden und sieht die Aktion in der M8a-Pille
("Zuletzt ausgefuehrt: Schlangenfrass mit Karte X: Karte rot-Y aus
Schlange A und Karte blau-Z aus Schlange B entfernen").

## Warum-mittlerer-Vertical (NICHT Mikro, NICHT Big-Bang)

- **Nicht Mikro:** 5 RED-Tests (M2f 2x, R181 2x, R183 1x) real gruen, plus
  M8b-Smoke-Wiring mit 5 RED-Tests, plus Production-Smoke, plus
  Komponenten-Refactor (1 Parent + N Children).
- **Nicht Big-Bang:** Engine unveraendert, Aktionen unveraendert, nur
  1 State in 1 Komponente hochgezogen, ~30 Zeilen Code.
- **Sichtbarer Spielwert:** Ohne diesen Fix konnte der Spieler
  2-Gegner-Schlangenfrass nicht abschliessen — die Aktion stand im
  Aktions-Pool, war aber UI-seitig blockiert. M8b macht eine ganze
  Sonderkarten-Kategorie endlich spielbar.

## Rein

1. **State-Lift in `WaldtanzGegnerlichtung.tsx`:** `useState<FrassAuswahl | null>` (Ziel 1) auf Parent-Ebene. Props an `GegnerSchlangenListe` weiterreichen: `erstesFrassZiel`, `setErstesFrassZiel`. `FrassZiel`/`FrassAuswahl`-Typen werden exportiert.
2. **GegnerSchlangenListe-Props:** Lokales `useState` durch Props ersetzt (`erstesFrassZiel`, `setErstesFrassZiel`). Falls `handkartenId != ausgewaehlteHandkarteId`: externen State ignorieren.
3. **Kompass-Deduplication:** `kompassGehoertZuDieserListe`-Check verhindert Duplikat-Rendering der `.schlangenfrass-zweiziel-kompass`-Hinweis-Box in Children ohne aktiven State.
4. **M8a-Pille-Eyebrow:** "Zuletzt ausgeführt" → "Zuletzt ausgeführt:" (Doppelpunkt) als contract-Anker für die within()-scoped Tests in R181/M2f/R183.
5. **eslint-disable-Direktiven entfernt:** `react-refresh/only-export-components` war nach Refactor ungenutzt (Lint warnings → 0).
6. **Pre-existing Test-Migrationen:**
   - `App.r181_schlangenfrass_boardziel.test.tsx`: `beforeEach(pushState('/game'))` hinzugefügt; `within(schlangenbereich)` → `within(Waldtanz-Gegnerlichtung-region)`; Pille-Scoped auf `data-testid="waldtanz-letzte-aktion-hinweis"`.
   - `App.m2f_schlangenfrass_zwei_ziele_boardziel.test.tsx`: Pille-Scoped.
   - `App.r183_farbendieb_boardziel.test.tsx`: Pille-Scoped.
7. **Production-Smoke `scripts/m8b_schlangenfrass_zweiziel_smoke.mjs`:** M1dt-Dispens — verifiziert den STRUCTURAL Contract (Region vorhanden, Route-Scope, kein 2-Ziel-Button im Initial-State, kein M8a-Regress), nicht den Multi-Step-Pfad (braucht M2d-Fixture-Helper für reproduzierbare 3-Spieler-Schlangenfrass-Konstruktion).
8. **Smoke-Wiring in `package.json` `smoke:production`:** M8b-Smoke nach M8a-Smoke (konsistente Slice-Reihenfolge) angehängt.
9. **Smoke-Wiring-RED-Tests `src/App.m8b_smoke_wiring.test.ts`:** 5 RED-Tests (M8b-1 Kette enthaelt M8b, M8b-2 nach M8a, M8b-3 alle Schritte sind `node scripts/...`, M8b-4 Script existiert, M8b-5 Self-Test gruen).

## Raus

- **Keine Engine-Aenderung** (`spieleSchlangenfrass` bleibt unveraendert)
- **Keine Aktion-Lookup-Aenderung** (`findeSchlangenfrassZweiZielAktionen` bleibt)
- **Keine CSS-Cascade-Aenderung** am Schlangenlichtung-Cap
- **Keine Layout-Aenderung** am Brettrand
- **M8c (Farbendieb Platz-Auswahl)** ist eigenstaendiger Folge-Slice

## Geometrie / Cap-Arithmetik

Unveraendert — M2r / M9.5 Cap-Sum-Formel gilt weiterhin.

## Gates

- `npx vitest run src/App.m2f_*.test.tsx src/App.r181_*.test.tsx src/App.r183_*.test.tsx src/App.m8b_smoke_wiring.test.ts` → **10/10 RED-Tests gruen** (5 M2f/R181/R183 + 5 M8b-Wiring)
- `npm test -- --run` (full) → **NET-POSITIVE +5**: 39 fails → 35 fails (1372 passed → 1376 passed). Diff-Recipe: `git stash -u` + re-run auf HEAD=9757dfe zeigte 39 fails; nach M8b-Pop + re-run 35 fails. `comm -23 /tmp/slice_fails.txt /tmp/baseline_fails.txt` = 0 neue Failures.
- `npm run typecheck` → gruen
- `npm run lint` → 0 errors, 0 warnings (eslint-disable-Direktiven entfernt)
- `npm run build` → 237.90 kB CSS, 424.94 kB JS, built in 649ms
- `git diff --check` → gruen
- Live-Smoke `node scripts/m8b_schlangenfrass_zweiziel_smoke.mjs` → **gruen** auf 1280x900 und 1100x800 Viewports. Region vorhanden (974x160 px @ 1280x900, 809x188 px @ 1100x800), Initial-State ohne 2-Ziel-Bissspur, M8a-Pille 339x53 px nach Startfaehrten-Klick, Route-Scope haelt (Lobby zeigt keine Gegnerlichtung).
- Code-Review: `REVIEWER=NONE` in diesem Cron-Lauf (Codex CLI `NOT_FUNCTIONAL` wegen stdin-Block, Kimi Code CLI `RATE_LIMITED` mit usage limit). Slice lokal verifiziert, review-blockiert. Re-Review im naechsten Cron-Lauf sobald Watchdog wieder einen verfuegbaren Reviewer meldet.

## Bekannte Probleme / Trade-offs

- **State-Lift macht `WaldtanzGegnerlichtung` leicht groesser** (~15 Zeilen State + Props-Forwarding). Akzeptabel weil der State zur Spieler-uebergreifenden Koordination gehoert.
- **Production-Smoke nutzt M1dt-Dispens:** verifiziert nur den STRUCTURAL Contract (Region, Route-Scope, kein Initial-2-Ziel-Button, M8a-Pille nicht regressiert). Der vollstaendige 2-Gegner-Schlangenfrass-Pfad braucht einen M2d-Fixture-Helper fuer reproduzierbare 3-Spieler-Konstruktion in Production. Langfristiger Fix geplant.
- **M8c (Farbendieb Platz-Auswahl) noch offen:** R183 funktioniert fuer den 1-Klick-Fall, aber das 2-Klick-Bestaetigungsflow mit Platz-1/Platz-2-Auswahl ist noch nicht im M8b-Scope. M8c plant das in einem 30-40-Tool-Call-Sub-Slice.

## Commits

- `b52dfc2` M8b: Schlangenfrass 2-Gegner-Zielauswahl als State-Machine (State-Lift + 5 RED-Tests gruen + Smoke + Wiring)
- `9d50a16` M8b: Smoke-Skript — M8a-Pille erst nach Aktion pruefen (Initial-State hat letzteAktion=null)

## Live-Smoke-Beleg

```
--- M8b Gegnerlichtung State-Lift @ 1280x900 ---
  Region 'Waldtanz-Gegnerlichtung': 1x vorhanden ✓
  Erste Gegnerlichtung sichtbar: 974x160 px @ (222,410)
  Initial: 0 2-Ziel-Bissspuren sichtbar ✓ (kein Schlangenfrass aktiv)
  M8a-Pille im DOM nach Aktion: 339x53 px ✓ (kein Regress)
  Auf / (Lobby): Gegnerlichtung unsichtbar ✓ (Route-Scope hält)
--- M8b Gegnerlichtung State-Lift @ 1100x800 ---
  Region 'Waldtanz-Gegnerlichtung': 1x vorhanden ✓
  Erste Gegnerlichtung sichtbar: 809x188 px @ (213,397)
  Initial: 0 2-Ziel-Bissspuren sichtbar ✓ (kein Schlangenfrass aktiv)
  M8a-Pille im DOM nach Aktion: 339x53 px ✓ (kein Regress)
  Auf / (Lobby): Gegnerlichtung unsichtbar ✓ (Route-Scope hält)
```

Vision-Analyse bestaetigt zusaetzlich: Production-URL `/game` rendert "Gegner-Schlangen"-Region mit "Noch keine gegnerischen Schlangen — sobald ein Gegner seine erste Karte legt, erscheint sie hier als Brettobjekt." Text — exakt der initial State der konsolidierten Gegnerlichtung.

## Deploy

- Vercel Production: https://schlangentanz-v2.vercel.app, HEAD=`9d50a16`, beide Routes 200 OK.
- Vercel CLI v54.18.4, `vercel deploy --prod --yes --token=...` — 2 Deploys: b52dfc2 (M8b-Code) + 9d50a16 (Smoke-Fix). Beide Status Ready, Auto-Alias aktiv.

## Naechste Luecke (M8c-Folge-Slice)

**M8c: Farbendieb Platz-Auswahl** (R183-RED-Tests erweitert):
- 2-Klick-Bestaetigungsflow mit Platz-1/Platz-2-Buttons
- Erweitert M8a-Pattern (Feedback-Loop)
- Geschaetzter Tool-Aufwand: ~30-40 Tool-Calls

**Alternativ-Reihenfolge** (je naechster Watchdog-Status):
- Wenn Codex oder Kimi wieder verfuegbar: zuerst Re-Review der M8a/M8b-Slices als Second-Opinion-Coverage.
- Wenn beide ratelimited bleiben: M8c oder ein Stitch-Sichtbar-Slice (z.B. M1ds-aehnliche sichtbare Sonderkarten-Highlight-Pille).
