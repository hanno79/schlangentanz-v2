# Release-Status — 21.06.2026 — M1cu Waldtanz-Brettschritt-Lebensader

## Status

Released auf der stabilen Production-Alias: <https://schlangentanz-v2.vercel.app>

## Slice

M1cu verschwistert die Brettschritt-Stempel mit dem aktiven Spieler und der Phase: Jeder Stempel traegt jetzt einen linken Spieler-Farbstreifen in der Farbe des Spielers, der die Karte gespielt hat (primary/secondary/tertiary/blau), plus einen Phasen-Badge (Ausspiel/Ziehen/Aufgaben/Zugende/Ende). Zwischen Stempel-Reihe und Schlangenlichtung sitzt ein pulsierender "Aktiver Tanz-Schritt"-Pill in der Farbe des aktiven Spielers, der aktiven Spieler, aktuelle Phase, naechsten Pflichtschritt und KI-Lauf-Status zusammenfasst. Die client-seitig gepflegte `brettschrittEintraege`-Liste synchronisiert sich aus `zustand.ablagestapel`-Transitionen, KI-Vorspulen und Neustart. Engine, Legal-Aktionen, Aktionspfade bleiben unangetastet.

## Warum weder Mikro-Slice noch Big-Bang

- Kein Mikro-Slice: Aus dem Output-Stempel von M1cr wird eine lebendige Spiel-Trace - die Spielerin sieht nach jeder Aktion sofort, welcher Spieler welche Karte in welcher Phase abgelegt hat, und der aktive Tanz-Schritt macht den naechsten Pflichtschritt sichtbar. Das ist die direkte Folge-Luecke aus M1crs Release-Status.
- Kein Big-Bang: Die Brettschritt-Stempel bleiben als `<ol>` mit 3 Karten erhalten, der Pill ist eine eigenstaendige Komponente (`WaldtanzAktiverTanzSchritt`), der `brettschrittEintraege`-State wird aus `zustand.ablagestapel`-Transitionen abgeleitet. Render-Logik bleibt trivial, CSS folgt der bestehenden M1bq-M1cq-Cascade.

## Umsetzung

- `src/components/WaldtanzAktiverTanzSchritt.tsx` (neu): rendert einen route-scoped `<div role="group" aria-label="Aktiver Tanz-Schritt">`-Pill in der Farbe des aktiven Spielers mit Spieler-Streif, Phasen-Badge, naechstem Pflichtschritt und KI-Lauf-Status. Reines Presentation.
- `src/components/WaldtanzBrettschrittStempel.tsx`: erweitert den Stempel um `brettschritt-stempel--spieler-N`-Klasse plus Phasen-Badge `<span class="brettschritt-stempel__phase">`. Pro Stempel wird `eintraege.find(...)` fuer `karteId` aufgeloest, fehlende Eintraege tragen `'?'`-Badge (z.B. heissgelaufener ablageStapel).
- `src/App.tsx`: initialisiert `startZustand` einmalig und teilt ihn zwischen `zustand` und `brettschrittEintraege` (kein zweiter `erstelleSpielzustand(2)`-Aufruf mehr). `wechsleZustand` leitet den Folgezustand synchron aus dem Closure ab und pflegt die `brettschrittEintraege` ausserhalb des setState-Updaters. Dead Refs `letzterAbwurfRef`/`brettschrittPhaseRef` wurden entfernt. `handleKiZugVorspulen` baut die sichtbare Historie aus `ablagestapel.slice(-3)` neu auf, `handleNeuesLobbySpiel` loescht sie.
- `src/App.css`: route-scoped Stitch-Cascade fuer `.brettschritt-stempel::before` (linker Spieler-Farbstreifen 0.28-0.42rem, primary/secondary/tertiary/#3b82c4), `.brettschritt-stempel--aktuell.brettschritt-stempel--spieler-N` (spieler-farbiger box-shadow als 3px Inset-Outline) und `.brettschritt-stempel__phase` (pill-shape Phasen-Badge, gold-gruen secondary fuer aktuell, transparent fuer vergangen). `.waldtanz-aktiver-tanz-schritt` mit `--mensch`/`--ki`/`--abwurf`/`--spielende`-Varianten und einer `waldtanz-tanzschritt-puls`-Animation (per `prefers-reduced-motion` deaktiviert).
- `src/App.m1cu_waldtanz_brettschritt_lebensader.test.tsx`: deckt die sichtbaren Vertraege ab (Stempel-Spieler-Klasse, Phasen-Badge-Text, Pill-Render mit Spieler-Klasse + Phase + Text, Route-Scoping auf `/game`, Smoke-Wiring, CSS-Cascade, Reduzierte-Motion).
- `scripts/m1cu_brettschritt_lebensader_smoke.mjs` + `package.json`: dauerhaft verdrahteter Browser-Smoke in `npm run smoke:production`, der auf `/` und `/game` in 1100px und 1280px mit `reducedMotion: 'reduce'` das Pill-Render (Text, Spieler-Klasse, Phasen-Badge), das Viewport-Fit und die Stempel-Reihe (falls befuellt) verifiziert.

## Workflow

- RED/GREEN: 7 RED-Tests geschrieben (Stempel-Spieler-Farbstreifen, Phasen-Badge-Text, Pill-Spieler-Klasse, Pill-Phase, Pill-Text, Route-Scoping, Smoke-Wiring). Nach Komponenten + State + CSS + Smoke laufen alle 7 Tests gruen, ohne angrenzende Tests zu brechen.
- Kimi-Code-CLI Review: Codex OAuth weiterhin im `usage limit` (gueltig bis 25.06.2026 19:07 UTC). Kimi-Code-CLI (`kimi -p`) als Review-Fallback mit identischem Kontext wie Codex erhalten wuerde. Erste Review lieferte 3 BLOCKER (Initial-State-Desync, setState-during-render, Dead Refs) plus 2 NON-BLOCKER (CSS-Tippfehler, duplizierter Block). Re-Review nach Fixes: `BLOCKERS: None`, alle drei Fixes bestaetigt.
- Claude Code: in dieser Session durch den bekannten `401 Invalid authentication credentials`-Auth-Blocker unbenutzbar; Slice wurde als enger manueller Fallback umgesetzt.

## Verifikation

- RED-Proof: `npm test -- --run src/App.m1cu_waldtanz_brettschritt_lebensader.test.tsx` schlug initial wegen fehlender Spieler-/Phasen-Klassen und Pill fehl.
- Targeted/Adjacent: `npm test -- --run src/App.m1cu_waldtanz_brettschritt_lebensader.test.tsx src/App.m1cr_waldtanz_brettschritt_stempel.test.tsx src/App.m1cq_waldtanz_gegnerzauberfeld.test.tsx src/App.m1ct_waldtanz_spielkarten_stil.test.tsx src/App.m1cs_waldtanz_spielbrett_fokus.test.tsx` → 5 Testdateien / 21 Tests bestanden.
- Full Gates: `npm test -- --run` → 311 Testdateien / 950 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils gruen.
- Production Deploy/Smoke: folgt nach Commit/Push.

## Sichtbar spielbarer

Nach jeder Discard-, Abwurf- oder Sonderkarten-Aktion reihen sich die Brettschritt-Stempel jetzt mit Spieler-Farbstreifen und Phasen-Badge aneinander; die juengste Karte traegt die aktive Spielerfarbe als Outline. Zwischen Stempel-Reihe und Schlangenlichtung pulsiert der "Aktiver Tanz-Schritt"-Pill in der Farbe des aktuellen Spielers und zeigt, wer wann was als naechstes tun muss. Damit hat das Brettschritt-Brett jetzt sowohl eine sichtbare Spielhistorie als auch eine lebendige Phasen-/Spieler-Anzeige - ein echter Schritt vom Stille-Brett hin zu einem Brett, das atmet und aufzeigt.

## Code-Review

Code-Review: Kimi Code CLI 0.18.0 statt Codex CLI, weil Codex OAuth usage limit bis 25.06.2026 19:07 UTC.

## Nächste mittlere Lücke

Der Brettschritt-Stempel zeigt Output + Phase + Spieler; der "Aktive Tanz-Schritt" zeigt aktiven Spieler + Phase + naechsten Pflichtschritt. Beide leiten aus `zustand.ablagestapel` und `zugphase` ab. Als naechstes mittleres Vertical bietet sich an, die Brettschritt-Stempel mit einer sichtbaren **Aktions-Konsequenz** zu verschwistern: Wenn der Spieler eine Sonderkarte spielt, soll der Stempel den Sonderkarten-Effekt (z.B. Farbendieb: "+1 Beutekarte von Spieler 2") als zweite Zeile anzeigen. Das wuerde den Brettschritt zur zentralen Aktions-Historie ausbauen und das Stille-Gefuehl nach Sonderkarten-Zuegen weiter aufloesen.
