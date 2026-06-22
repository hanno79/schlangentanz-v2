# M1cy — Waldtanz-Gegnerplakette als Stitch-Spielobjekt

> **Status:** Release complete (cron-run 22.06.2026 08:18 UTC).
> **Typ:** Mittlerer Vertical (UI/UX, Brettobjekt), kein Engine-Touchpoint.
> **Vorgänger:** M1cx (Waldtanz-Spielerplakette).
> **Nachfolger:** M1d0 (Layout-Konsolidierung, bereits geplant in `docs/slices/M1d0_waldtanz_layout_konsolidierung.md`).

## Was sichtbar spielbarer wurde

Vor M1cy stand der Spieler links mit seiner Plakette, aber der naechste Gegner
war nur als abstrakte Schlangen-Saeule ueber dem Brett sichtbar. Mit M1cy
steht jetzt **rechts oben** im Spieltisch eine zweite koerperliche Stitch-Plakette,
die den naechsten Gegner mit Avatar, Name, Punktzahl-Pille, Handkarten-Zahl
und einem fetten **"KOMMT DRAN"**-Indikator zeigt. So erzaehlt das Brett die
Geschichte beider Akteure auf einen Blick: Spieler links, Handkarten Mitte,
naechster Gegner rechts.

Die Positionierung wurde bewusst **rechts oben** gewaehlt — rechts unten sitzt
der Waldtanz-Arenazugknopf (End-Turn-Aktion) und beide Elemente wuerden sich
gegenseitig verdecken. Stattdessen flankieren die Spielerplakette und die
Gegnerplakette den Spieltisch oben (links/rechts), Handkarten + Arenazugknopf
bilden die Aktionsflaeche in der Mitte.

## Slice-Scope

### Rein
- Neue Komponente `WaldtanzGegnerplakette` mit 3px-Waldgruen-Border, Hard-Shadow,
  Tertiary-Container-Hintergrund (visuelle Unterscheidung von Spielerplakette
  mit Primary-Container).
- Neue Hook `useSpielLabels` und Helper-Modul `spielLabelHelpers`: extrahiert
  die derivierten Anzeige-Strings (Pflichtschritt, Empfehlung, Gewinner-/Ergebnis-
  Text, Spielerfuehrungs-Zielverweise) aus `App.tsx`. Hintergrund: App.tsx war
  bei 522 Zeilen, der M1cy-Vorbereitungsschritt hat es auf 485 reduziert
  (hartes 500-Zeilen-Budget).
- Neuer CSS-Token `--st-color-on-tertiary-container: #a22900` (war vorher
  unbenutzt und fiel still auf inherited black zurueck — Kimi-Review-Regression
  aus M1cw/M1cx).

### Raus (explizit)
- Keine Engine-Aenderung.
- Keine Regel-Aenderung.
- Keine neuen Spielobjekte jenseits der Plakette (keine Buttons, keine Karten).
- Kein Layout-Refactor — M1d0 (Layout-Konsolidierung) macht den Grid-Flow.

## RED → GREEN

### RED-Tests
- `src/App.m1cy_waldtanz_gegnerplakette.test.tsx` (13 Tests, 197 Zeilen)
- `src/App.m1cy_waldtanz_gegnerplakette_smoke_wiring.test.ts` (3 Tests, 31 Zeilen)

### Kimi-Review (Codex OAuth usage_limit bis 25.06.2026 19:07 UTC)
- Kimi Code CLI v0.18.0 als Fallback-Reviewer.
- Sanity-Check vorab: `kimi --prompt "KIMI_OK"` → OK.
- Review-Session: `session_0ecb604f-9153-4920-b2b7-4a5d8e9e9e0e`.
- Ergebnis: **0 BLOCKERS, 5 NON-BLOCKERS.**
- Behoben in derselben Slice (RED→GREEN):
  1. Single-Player-Guard (`zustand.spieler.length > 1`) — defensiv,
     praktisch nicht erreichbar (Lobby fordert 1+KI), aber billiges Hardening.
  2. Kimi-Phrasing-Drift: `spielLabelHelper` → `spielLabelHelpers` im
     Datei-Header-Kommentar von `src/spielLabelHelpers.ts`.
- Bewusst nicht behoben (akzeptabel):
  3. "Kommt dran"-Indikator ist nicht steuerbar — Komponente wird ausschliesslich
     fuer den naechsten Gegner gerendert, Dokumentation im Komponenten-Header
     reicht.
  4. Test-Coverage fuer 3-4 Spieler + menschlichen Gegner — Folge-Slice,
     nicht M1cy-Scope.
  5. Smoke-URL-Fallback — bereits ueber `SMOKE_BASE_URL`-Env-Variable
     konfigurierbar, weitere Doku nicht noetig.

## Gates (alle gruen)

- [x] **Focused Tests:** 13 M1cy-Tests + 3 Smoke-Wiring-Tests passed
- [x] **Full Suite:** `npm test -- --run` → 318 Test Files, **992 Tests passed**
- [x] **Typecheck:** `npm run typecheck` passed
- [x] **Lint:** `npm run lint` passed
- [x] **Build:** `npm run build` → 188.35 kB CSS, 395.58 kB JS, built in 286 ms
- [x] **Test-Lines:** alle Test-Dateien < 500 Zeilen
- [x] **Diff-Hygiene:** `git diff --check` clean
- [x] **Line-Budget:** `App.tsx` = 485 Zeilen (unter 500)
- [x] **Kimi Code Review:** 0 Blocker, 5 Non-Blockers (2 in-slice behoben, 3 akzeptiert)

## Geaenderte / neue Dateien

| Datei | Typ | LoC | Beschreibung |
|---|---|---|---|
| `src/components/WaldtanzGegnerplakette.tsx` | NEU | 61 | Brettobjekt-Komponente |
| `src/hooks/useSpielLabels.ts` | NEU | 95 | Label-Hook |
| `src/spielLabelHelpers.ts` | NEU | 42 | Format-Helper |
| `src/App.m1cy_waldtanz_gegnerplakette.test.tsx` | NEU | 197 | 13 Vitest-Tests |
| `src/App.m1cy_waldtanz_gegnerplakette_smoke_wiring.test.ts` | NEU | 31 | 3 Wiring-Tests |
| `scripts/m1cy_waldtanz_gegnerplakette_smoke.mjs` | NEU | 135 | Production-Browser-Smoke |
| `src/App.tsx` | GEAENDERT | 485 (+37 / -48) | Komponente eingebunden, Label-Hook konsumiert, Single-Player-Guard |
| `src/App.css` | GEAENDERT | +114 | Plakette-Styling + Token-Definition |
| `package.json` | GEAENDERT | +1 | Smoke in `smoke:production`-Kette aufgenommen |

## Release-Chain

1. RED-Tests geschrieben → RED bestaetigt (1 Test schlug fehl vor Single-Player-Guard).
2. Code-Implementierung + Kimi-Review + 2 Non-Blocker-Fixes → GREEN.
3. Full Gates (Tests, Typecheck, Lint, Build, Test-Lines, Diff-Check) gruen.
4. Commit auf `main`, Push zu `origin/main`.
5. Vercel Production Deploy via `vercel deploy --prod --token="$VERCEL_TOKEN"`.
6. Live-Smoke auf `https://schlangentanz-v2.vercel.app/game` (Playwright).
7. Smoke-Wiring verifiziert (M1cy-Smoke in npm-Script eingebunden, Position nach M1cx).

## Naechster geplanter Vertical

**M1d0 Waldtanz-Layout-Konsolidierung** (siehe `docs/slices/M1d0_waldtanz_layout_konsolidierung.md`):
- Benoetigt M1cy gruen + released — Bedingung erfuellt.
- Benoetigt Antwort auf 3 User-Abnahme-Punkte (mobile Strategie, Plakette-
  Position-Refactor, Screenshot-Vorher/Nachher).
- Benoetigt Dart-Task-Anlage (MCP war beim Anlegen HTTP-500 unreachable —
  wird bei naechster Erreichbarkeit als `M1d0` nachgereicht).