# Release-Status — 22.06.2026 — M1cx Waldtanz-Spielerplakette

## Status

Released auf der stabilen Production-Alias: <https://schlangentanz-v2.vercel.app>

## Slice

M1cx macht den aktiven Spieler am Waldtanz-Brett als koerperliche Stitch-Spielerplakette
sichtbar: links neben der Handkartenleiste sitzt eine chunky Pill-Karte mit
3px-Waldgruen-Border, Hard-Shadow und Primary-Container-Hintergrund, die Avatar,
Spielername, grosse Punkte-Pille und Handkarten-Zaehler des aktiven Spielers zeigt.
Zusaetzlich wird der Layout-Overlap aus M1cv/M1cw aufgeloest (Handkante -38px ueber
der Schlangenlichtung wird auf >=70px geraeumt), damit das erste /game-Bild wieder eine
freie Schlangenlichtung zeigt. Engine, Legal-Aktionen und Ausfuehrungspfade bleiben
unangetastet.

## Warum weder Mikro-Slice noch Big-Bang

- Kein Mikro-Slice: M1cx schliesst die letzte sichtbare Luecke des ersten /game-Bildes.
  M1cv/M1cw haben Brettschritt + Questband + Aktions-Konsequenz verschwistert, aber der
  Spieler selbst war im Brett-Layout weiterhin unsichtbar (nur Debug-Liste in
  Spieleruebersicht). Mit der Plakette weiss die Spielerin jetzt jederzeit, in wessen
  Hand sie gerade spielt und wer fuehrt.
- Kein Big-Bang: M1cx ist eine reine Anzeige-Erweiterung. Es entsteht eine neue
  Komponente (54 Zeilen), die nur fuer /game eingeblendet wird, plus eine
  Layout-Korrektur (Hand grid-row 3 -> 4), die als CSS-Reparatur die M1ax-Freiraum-
  Luecke schliesst. Engine, Legal-Aktionen, Ausfuehrungspfade, Brettschritt-Historie,
  Questband bleiben unveraendert. Keine Engine-Touchpoints.

## Umsetzung

- `src/components/WaldtanzSpielerplakette.tsx` (neu, 54 Zeilen):
  - `<section className="waldtanz-spielerplakette" aria-labelledby={titelId}>`
  - `<h3>` mit Spielername + Emoji-Avatar (Mensch=Kobold, KI=Frosch)
  - Punkte-Pille mit eigener aria-label (Singular/Plural)
  - Handkarten-Span mit aria-label
  - Lokale `useId()`-IDREF fuer aria-labelledby (kein Clash mit Spieleruebersicht-Panel).
- `src/App.tsx`:
  - Import + Render `<WaldtanzSpielerplakette>` innerhalb des `istGameRoute`-Blocks,
    VOR `<HandkartenPanel>`. Werte stammen aus `aktiverSpieler`, `aktiverSpielerWertung`,
    `aktiverSpieler.hand.length`.
- `src/App.css`:
  - `:root` ergaenzt um `--st-color-on-surface`, `--st-color-on-primary-container`,
    `--st-color-on-secondary-container` (vorher unbenutzt, fielen still auf
    `inherit`/`black` zurueck — Kimi-Review-Blocker-Pattern aus M1cw wiederholt).
  - `.spielbereich--game-route [class~="spielbrett--waldtanz"]` bekommt
    `position: relative` als Anker fuer die absolute Plakette.
  - `.waldtanz-spielerplakette`/`__name`/`__name-text`/`__avatar`/`__punkte`/
    `__handkarten`: chunky Pill-Design mit 3px-Border, Hard-Shadow,
    Primary-Container-Gradient, 999px-Avatar-Pille, secondary-Container-Punkte-Pille.
  - Plakette wird absolute positioniert (links unten im Spieltisch-Container), damit
    das bestehende 1x7-Grid nicht umstrukturiert werden muss.
  - `.handkarten-panel` wandert von `grid-row: 3` (Collision mit Arenastein) auf
    `grid-row: 4` (sauber UNTER Arenastein, align-self: end).
  - `.waldtanz-arenastein__schlangenlichtung` Mindesthoehe von `min(22rem, 48vh)` auf
    `min(18rem, 40vh)` reduziert, damit Arenastein + Hand + Brettschritt-Stempel +
    Plakette in das 900px-Erstbild passen.
- `src/App.m1cx_waldtanz_spielerplakette.test.tsx` (neu, 9 Tests): Plakette in
  Spieltisch auf /game sichtbar, NICHT auf /, Punkte-Pille als Headline,
  Handkarten-Zaehler + Avatar, CSS-Source-Stitch-Tokens (Border 3px, Hard-Shadow,
  Primary-Container, Punkteschrift Headline, Avatar 999px), Layout-Cascade
  (Plakette-Block vor Handkarten-Tiefenfaecher), Hand grid-row >= 4,
  Smoke-Wiring in package.json, Token-Definition in :root (Kimi-Review-Regression).
- `src/App.m1cx_waldtanz_spielerplakette_smoke_wiring.test.ts` (neu, 3 Tests):
  package.json-Skript enthaelt m1cx-Smoke, liegt nach m1cw-Smoke in der Kette,
  Smoke-Skript-Datei existiert.
- `src/App.m1ae_*.test.tsx`/`m1ao_*.test.tsx`/`m1aw_*.test.tsx`/`m5g_*.test.tsx`
  (modified): Erwartungen an grid-row 4 + min-height 18rem angepasst;
  m5g defensive Negativ-Pruefung von `--st-color-on-secondary-container` entfernt,
  stattdessen positive Token-Pruefung (Token wird jetzt legitim verwendet).
- `scripts/m1cx_waldtanz_spielerplakette_smoke.mjs` (neu, 121 Zeilen):
  Browser-Smoke auf /game (1280x900, reducedMotion: reduce). Prueft: Plakette
  vorhanden + sichtbar auf /game, NICHT auf /, borderTopWidth >=3px,
  boxShadow != none, Punkte-Text numerisch, Avatar vorhanden,
  M1ax-Freiraum >=70px (Hand.y - Schlangen.y), keine console/page errors.
- `scripts/live_smoke.mjs` (modified): Hand-Arena-Abstand akzeptiert jetzt bis 80px
  statt 40px (Hand ist grid-row 4, also tiefer), Kartenfaecher-Y bis 870px
  statt 790px.
- `package.json`: `smoke:production` um `m1cx_waldtanz_spielerplakette_smoke.mjs`
  erweitert (nach M1cw-Smoke, am Ende der Kette).

## Workflow

- RED/GREEN: 9 RED-Tests geschrieben (Plakette rendert, Lobby bleibt ohne,
  Punkte-Pille, Avatar+Handkarten, CSS-Source-Stitch-Tokens, Layout-Cascade,
  Hand grid-row >= 4, Smoke-Wiring, Token-Definition in :root). Nach Komponente +
  CSS + Tests + Smoke laufen alle 9 Tests gruen. Nach Kimi-Review 1.
  BLOCKER-Befund (keiner) und 5 NON-BLOCKERS, davon 1 actionable (veralteter
  CSS-Kommentar Zeile 2155: "grid-row: 3" statt 4) — gefixt. Danach erneuter
  targeted + typecheck + lint + build gruen.
- Claude Code: in dieser Session durch den bekannten `401 Invalid authentication
  credentials`-Auth-Blocker unbenutzbar; der Slice wurde als enger manueller
  Fallback umgesetzt.
- Kimi Code CLI Review: Codex OAuth weiterhin im `usage limit` (gueltig bis
  25.06.2026 19:07 UTC). Kimi-Code-CLI (`kimi -p`) als Review-Fallback mit
  identischem Kontext wie Codex erhalten wuerde. Review lieferte 1 BLOCKER (keinen)
  + 5 NON-BLOCKERS. Actionable: veralteter CSS-Kommentar — gefixt. Re-Tests gruen.

## Verifikation

- RED-Proof: Initial schlugen Plakette-Tests fehl wegen fehlender Komponente +
  Render-Path + fehlender CSS-Source-Tokens + fehlender Smoke-Wiring + Token-Defizit
  in :root.
- Targeted: `npx vitest --run src/App.m1cx_waldtanz_spielerplakette.test.tsx` -> 9/9
  gruen; `npx vitest --run src/App.m1cx_waldtanz_spielerplakette_smoke_wiring.test.ts`
  -> 3/3 gruen.
- Full Gates: `npm test -- --run` -> 316 Testdateien / 976 Tests bestanden;
  `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`,
  `git diff --check` jeweils gruen.
- Production Deploy/Smoke: siehe CHANGELOG/commit-Status; final HEAD = M1cx-Commit.

## Sichtbar spielbarer

Unmittelbar nach `Spiel starten` sieht die Spielerin links neben ihrer Handkartenleiste
eine **koerperliche Stitch-Spielerplakette** mit:
- grossem Emoji-Avatar (Kobold fuer Mensch, Frosch fuer KI) in einer runden gelben
  Pille mit 3px-Waldgruen-Border und Lift-Shadow.
- dem eigenen Spielernamen als fette Headline.
- einer grossen gelben Punkte-Pille mit der aktuellen Punktzahl (z. B. "0").
- einem Handkarten-Zaehler ("X 🃏").

Die Plakette ist statisch dekoativ (kein Button), aber sie macht den aktiven Spieler
im Brett sichtbar — vorher war der Name nur in der Debug-Liste der Spieleruebersicht.
Zusaetzlich ist die Handkartenleiste jetzt **sauber UNTER dem Arenastein** statt mit
-38px darueber, sodass die Schlangenlichtung wieder als freie Spielflaeche
sichtbar ist. Das ist ein konkreter Schritt vom Click-Simulator hin zu einem
Spielbrett, das dem Spieler zeigt, in welcher Rolle er gerade spielt.

## Code-Review

Code-Review: Kimi Code CLI 0.18.0 statt Codex CLI, weil Codex OAuth usage limit
bis 25.06.2026 19:07 UTC.

## Nächste mittlere Lücke

Vorschlag fuer den naechsten mittleren Vertical Slice Richtung "echtes Spielerlebnis":

**M1cy Waldtanz-Spielerverlauf-Brett**: die Spielerplakette zeigt aktuell nur
Avatar + Name + Punkte + Handkarten. Der naechste sichtbare Schritt waere,
die naechste gegnerische Schlange als zweites Plakette-Element **rechts neben
der Hand** sichtbar zu machen — quasi der "kommende Gegner" mit eigener
Punkte-Pille, Handkarten-Zaehler und Avatar. Damit sieht die Spielerin sowohl
ihren eigenen Status (links) als auch den naechsten Gegner (rechts) und das
Spielbrett erzaehlt die Geschichte beider Akteure auf einen Blick. Das waere
ein weiterer sichtbarer Schritt vom Click-Simulator hin zu einem
Mehrspieler-Brett, klein genug fuer TDD/Review/Release in einem Lauf.

Alternative falls der Fokus auf Engine-nahe Brettobjekte wechseln soll:
**M1da Schlange-als-Spielzug-Pfad** — die eigene Schlange bekommt einen
sichtbaren "Wachstums-Verlauf" auf dem Brett (Pfeil von alter zu neuer Position),
damit der Spieler sieht, wo sein naechster Zug seine Schlange hinbewegt.