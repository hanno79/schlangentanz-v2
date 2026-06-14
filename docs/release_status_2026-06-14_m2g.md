/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für M2g — Farbenfusion wird als sichtbares Kartenpaar im Waldtanz-Brett ausgeführt.
*/

# Release-Status M2g — Farbenfusion-Paarziel am Brett

## Status

Release komplett auf der stabilen Production-Alias: <https://schlangentanz-v2.vercel.app>

Zeitpunkt: 2026-06-14 16:42:05 UTC  
Feature-Commit: `9b8e8b3d3e9a9cbf54a3e199ba621d37fe9ec63d`

## Scope

M2g ist ein mittlerer board-naher Interaktions-Vertical nach M2f/R180: `Farbenfusion` war bereits engine-legal und board-nah ausführbar, fühlte sich aber noch wie ein Button auf einer Einzelkarte an. Der Slice macht die eigentliche Spielerentscheidung sichtbar: zwei benachbarte gleichfarbige Karten werden als gemeinsames Fusion-Paar hervorgehoben, mit Punkten erklärt und über die bereits enumerierte `FarbenfusionSpielen`-Aktion ausgeführt.

Nicht geändert: Engine-Regeln, Legal-Action-Enumeration, Aktionsdock-Fallback, Drag-and-drop, KI-Vorspulen, Lobby, Schlangenbuch und Sieger-Party.

## Umsetzung

- `src/components/farbenfusionPaarInfo.ts` berechnet aus vorhandenen `FarbenfusionSpielen`-Aktionen, ob eine Kartenfläche Startkarte oder Partner eines legalen Paares ist.
- `src/components/FarbenfusionPaarziel.tsx` rendert auf der Startkarte die Plakette `Fusion: <erste> + <zweite> · <punkte> Punkte` und den Button `Paar fusionieren`; auf der Partnerkarte erscheint `Paarpartner für Farbenfusion`.
- `src/components/Schlangenbereich.tsx` nutzt die Helper-Komponente, markiert beide Karten mit `schlangekarte__karte--farbenfusion-paar` und nur die Aktions-Startkarte zusätzlich mit `schlangekarte__karte--farbenfusion-ziel`.
- `src/App.css` ergänzt Google-Stitch/Waldtanz-Styling mit bestehenden Tokens: 3px Outline, sunny/lime Fläche, Dark-Forest-Hard-Shadow und Pill-Plaketten.
- `src/App.r180_farbenfusion_boardziel.test.tsx` wurde auf den neuen Paar-Buttonnamen nachgezogen, damit der alte Boardziel-Vertrag weiter die neue Affordance prüft statt stale Copy zu erzwingen.

## Verifikation

- RED: `npm test -- --run src/App.m2g_farbenfusion_paarziel.test.tsx` fiel initial erwartungsgemäß fehl, weil `schlangekarte__karte--farbenfusion-paar`, Paarplaketten und Paar-Button fehlten.
- Targeted GREEN: `npm test -- --run src/App.m2g_farbenfusion_paarziel.test.tsx src/App.r180_farbenfusion_boardziel.test.tsx` → 2 Testdateien / 2 Tests bestanden.
- Codex Review ließ die fokussierten Tests, `npm run typecheck` und `npm run lint` ebenfalls laufen und meldete final `BLOCKERS: None`, `NON-BLOCKERS: None`.
- Full Gates: `npm test -- --run` → 215 Testdateien / 723 Tests bestanden.
- `npm run check:test-lines` → alle Testdateien unter 500 Zeilen.
- `npm run typecheck` → bestanden.
- `npm run lint` → bestanden.
- `npm run build` → bestanden (`dist/assets/index-CR7Dju72.js`, `dist/assets/index-D5nUyQ4M.css`).
- `git diff --check` → bestanden.

## Review / Workflow-Abweichung

Claude Code und die separate `/simplify`-Vorprüfung mit `--model opusplan` wurden wie gefordert versucht, waren aber weiterhin durch den bestehenden Auth-Blocker blockiert:

```text
Failed to authenticate. API Error: 401 Invalid authentication credentials
```

Der enge manuelle Fallback wurde genutzt. Codex Review prüfte den uncommitted Diff inklusive untracked M2g-Dateien; Ergebnis:

```text
BLOCKERS
None.

NON-BLOCKERS
None.
```

Codex bestätigte insbesondere Engine-Autorität über enumerierte `FarbenfusionSpielen`-Aktionen, korrekt gescopte Paarmarkierung, eindeutige Accessible Names, keine Hook-/State-Probleme, definierte CSS-Tokens und sichere Zeilenbudgets (`src/App.tsx` 500, `src/components/Schlangenbereich.tsx` 475).

## Release

- Commit/Push: `9b8e8b3 — M2g: Farbenfusion als Kartenpaar spielbar machen` wurde nach `origin/main` gepusht.
- Deploy: Vercel Production auf stabile Alias <https://schlangentanz-v2.vercel.app> (`READY`, Alias gesetzt).
- Smoke: `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production` grün mit `/` und `/game` HTTP 200; Kernregionen `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich` sichtbar.
- M2g-Browser-Smoke: `/` und `/game` HTTP 200; sichtbar im Browser: `Spielbereich`, `Spieltisch`, `Schlangenbereich`, `Handkarten`, `Waldtanz-Zielkompass`, 5 Handkarten-Buttons; keine Console-/Page-Errors. Zusätzlich beweist der ausgelieferte Production-Bundle die M2g-Oberfläche (`schlangekarte__karte--farbenfusion-paar` und `Farbenfusion-Paar im Schlangenbereich` in `/assets/index-CR7Dju72.js` / `/assets/index-D5nUyQ4M.css`).

Hinweis zur Live-Reichweite: Die exakte Farbenfusion-Paar-DOM-Situation bleibt lokal deterministisch regressionsgetestet, weil eine passende `Farbenfusion`-Handkarte plus eigene gleichfarbige Kartenpaar-Schlange in einer bounded Production-Session nicht zuverlässig erreichbar ist, ohne Debug-/Fixture-Einstieg in die Live-App einzubauen.

## Nächste mittlere Lücke

Weiterhin mittlere, spielwertige Verticals statt A11y-Mikroslices: Entweder die verbliebenen Sonderkarten-Ziele im selben Spielobjekt-Stil abrunden oder als nächstes eine echte Mehrzug-/Endspurt-Playability-Strecke bauen, bei der Zielkompass, KI-Vorspulen, Zugkompass und Sieger-Party in einem repräsentativen Spielablauf zusammenspielen.
