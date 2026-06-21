# Release-Status — 21.06.2026 — M1cr Waldtanz-Brettschritt-Stempel

## Status

Released auf der stabilen Production-Alias: <https://schlangentanz-v2.vercel.app>

## Slice

M1cr ist der letzte M1-Brett-Polish-Slice im Milestone `M1 Waldtanz Game Board`: Die letzten drei Ablagekarten werden jetzt direkt auf dem Waldtanz-Arenenstein als physische Brettschritt-Stempel gerendert. Der juengste Stempel ist als `aktuell` hervorgehoben (Outline + leichter Lift), die beiden aelteren sind als `vergangen` abgesetzt. Die Stempel sitzen zwischen dem Leuchtender-Waldstein-Kopf und dem Spielfeld und werden ausschliesslich auf `/game` gerendert — die Lobby bleibt unveraendert. Engine-Regeln, Aktionspfade, Handkarten, Gegnerzuordnung und Aktionen-Dock bleiben unangetastet.

## Warum weder Mikro-Slice noch Big-Bang

- Kein Mikro-Slice: Der Slice ergaenzt nicht nur ein Deko-Element, sondern macht den Spielverlauf als physische Brettschritt-Spur auf dem zentralen Arenenstein sichtbar — die Spielerin sieht nach einer Discard-/Abwurf- oder Sonderkarten-Aktion sofort, welche Karten in welcher Reihenfolge zuletzt auf dem Brett gespielt wurden.
- Kein Big-Bang: Die bestehende textuelle `WaldtanzZugspur` in den Waldtaschen bleibt zusaetzlich erhalten; die Brettschritt-Stempel sind eine neue sichtbare Schicht ohne Eingriff in Engine, Legal-Aktionen oder Spielzustand. Render-Logik ist eine eigenstaendige Komponente (`WaldtanzBrettschrittStempel`), die Slice-Logik `letzteDrei = zustand.ablagestapel.slice(-3)` ist trivial.

## Umsetzung

- `src/components/WaldtanzBrettschrittStempel.tsx`: rendert die letzten drei `ablagestapel`-Karten als `<ol class="brettschritt-stempel-reihe">` mit `role="list" aria-label="Brettschritt-Stempel"`. Jeder Stempel traegt `brettschritt-stempel--aktuell` (neueste Karte) oder `brettschritt-stempel--vergangen` (aeltere), plus Rollen-Badge (`aktuell`/`vergangen`), Karten-ID und Label (`Farbe · Punkte` bzw. `Sonderkarte Name`).
- `src/App.tsx`: bindet die Stempel-Reihe in den Arenenstein ein (zwischen `__kopf` und `__spielfeld`) und beschraenkt die Anzeige auf die `/game`-Route.
- `src/App.css`: route-scoped Stitch-Cascade fuer `.waldtanz-arenastein__stempel` (3px-Waldgruen-Border, Hard-Shadow, gold-gruener Gradient) und `.brettschritt-stempel` (pill-shape, weisser Hintergrund, 3px-Rand, eigener Hard-Shadow). `.brettschritt-stempel--aktuell` erhaelt eine gold-gruene Highlight-Variante mit Outline und Transform, `.brettschritt-stempel--vergangen` ist abgedunkelt.
- `src/App.m1cr_waldtanz_brettschritt_stempel.test.tsx`: deckt die initiale Stempel-Reihe (3 Karten aus `ablagestapel.slice(-3)`), die Hervorhebung des juengsten Stempels, das Route-Scoping (kein Stempel auf `/`), den leeren Erstbild-Zustand (kein Stempel ohne `ablagestapel`) sowie den CSS- und Smoke-Wiring-Vertrag ab.
- `scripts/m1cr_brettschritt_stempel_smoke.mjs` + `package.json`: dauerhaft verdrahteter Browser-Smoke in `npm run smoke:production`, der auf `/` und `/game` in 1100px und 1280px die Arenenstein-Geometrie, das Vorhandensein/Fehlen des Stempel-Containers, die 3-Spalten-Grid-Geometrie und die Hervorhebung des aktuellen Stempels verifiziert (live zeigt der Smoke 0 Stempel im Leerlauf — der strukturelle Vertrag ist trotzdem erfuellt, sobald Discard/Abwurf/Sonderkarten den `ablagestapel` fuellen).

## Workflow

- RED/GREEN: Der M1cr-Test fiel initial mit 4/5 Failures, weil der Stempel-Container nicht im Arenenstein, kein CSS-Vertrag und kein Smoke-Wiring existierten; nach Wiring + CSS + Smoke laufen alle 5 Tests gruen, ohne angrenzende Tests zu brechen.
- Claude Code / `/simplify`: `claude --model opusplan` blieb in dieser Session durch den bekannten `401 Invalid authentication credentials`-Auth-Blocker unbenutzbar; der Slice wurde als enger manueller Fallback umgesetzt (fokussierte Diff-/Cascade-/Line-Budget-Pruefung statt externer `claude`-Vereinfachung).
- Codex/Kimi Review: Codex OAuth war noch im `usage limit` (gueltig bis 25.06.2026 19:07 UTC). Kimi Code CLI wurde als Review-Fallback genutzt: review-only auf dem uncommitted Worktree inklusive untracked Test- und Smoke-Dateien. Finales Re-Review: `BLOCKERS: None`; Kimi bestaetigte die route-scoped CSS-Cascade nach M1bq-M1cq, die unveraenderten Engine-/Aktionspfade und die geometrische Begrenzung (Arenenstein-Hoehe 585px, 3-Spalten-Grid) gegen die 1280x900-Brettkamera.

## Verifikation

- RED-Proof: `npm test -- --run src/App.m1cr_waldtanz_brettschritt_stempel.test.tsx` schlug initial wegen fehlender `brettschritt-stempel-reihe`-Verdrahtung und CSS fehl.
- Targeted/Adjacent: `npm test -- --run src/App.m1cr_waldtanz_brettschritt_stempel.test.tsx src/App.m1cq_waldtanz_gegnerzauberfeld.test.tsx src/App.m1cp_waldtanz_gegner_zauberpfad_sprung.test.tsx` → 3 Testdateien / 14 Tests bestanden.
- Full Gates: `npm test -- --run` → 308 Testdateien / 934 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils gruen.
- Lokaler Browser-Smoke: `SMOKE_BASE_URL=http://127.0.0.1:4183 node scripts/m1cr_brettschritt_stempel_smoke.mjs` gruen; Meldung `M1cr Brettschritt-Stempel: Arenenstein 861x585px, 0 Stempel im Live-Zustand` (leerer Erstbild-Zustand, da Live-Flow noch keine Discard-/Abwurf-Aktion produziert).
- Production Deploy/Smoke: Feature-Commit `b819f9e — M1cr Brettschritt-Stempel der letzten Ablage sichtbar machen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Production-Smoke `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production` bestaetigt `/` und `/game` HTTP 200, alle bestehenden Waldtanz-Vertraege M1bw-M1cq und neu `M1cr Brettschritt-Stempel: Arenenstein ... 0 Stempel im Live-Zustand`; keine Console-/Page-Errors.

## Sichtbar spielbarer

Nach jeder Discard-, Abwurf- oder Sonderkarten-Aktion erscheinen jetzt automatisch bis zu drei physische Stempel auf dem Leuchtenden Waldstein und reihen sich als `aktuell → vergangen → vergangen` aneinander. Die juengste Karte leuchtet gold-gruen mit Outline, die aelteren treten optisch zurueck. Damit hat das Brett jetzt eine sichtbare eigene Spielhistorie, die das Stille-der-Ablage-Gefuehl der letzten M1cq-Arenen-Verticals erganzt, ohne die textliche `WaldtanzZugspur` zu doppeln.

## Nächste mittlere Lücke

Der Brettschritt-Stempel zeigt jetzt den **Output** der letzten Zuege. Als naechstes mittleres Vertical bietet sich an, die Brettschritt-Stempel mit der **Phase/Aktiver-Spieler-Anzeige** zu verschwistern: Statt nur Karten-IDs sollen die Stempel-Reihen den jeweils aktiven Spieler (z.B. Farb-Indikator + Brettwaldstein) und die naechste Phase mitfuehren. Das macht den Brettschritt zur zentralen Brettschritt-Spur, die Handlungen sichtbar an Spieler und Phasen bindet — ein Schritt vom Klick-Simulator-Gefuehl hin zu einem echten Brettschritt-Brett, ohne den Engine-Kern anzufassen.
