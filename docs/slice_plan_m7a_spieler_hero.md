# Slice-Plan — M7a: Waldtanz-Spieler-Hero als Stitch-Stats-Card auf /game

## Slice

**M7a — Waldtanz-Spieler-Hero als Stitch-Stats-Card** auf `/game`. Die linke
Waldtanz-Spielrahmen-Spalte bekommt **additiv** einen grossen Stitch-Stats-
Hero-Block: Avatar quadratisch 64×64 mit 3px Border, grossem Namen + Tag
darunter, Punkte-Zahl prominent, alles in einer forest-container-Karte mit
hard-shadow. Die bestehenden Rankenchips (Phase/Hand/Quest) und der
Waldtanz-Kompass bleiben unveraendert (pre-existing M1ci/M1d3/M1dn-
Vertraege). M7a ist daher **rein additiv** — kein Umbau, keine Migrations-
Aufwand auf 4-5 pre-existing Test-Files.

## Warum mittlerer Vertical (nicht Mikro, nicht Big-Bang)

- **Nicht Mikro:** Aendert mehrere sichtbare Regionen gleichzeitig (Profil-
  Karte, Rankenchips, Quest-Block). Beweisbar mit 8-10 RED-Tests auf
  Klasse-Bodies, aria-labels, CSS-Source-Deklarationen.
- **Nicht Big-Bang:** ~100-140 Zeilen Diff, ein bestehendes Component-File
  (`WaldtanzSeitenmenue.tsx`) plus ~80 Zeilen CSS-Block in `App.css`.
  Kein Engine-Touch, keine Layout-Reorganisation der Spielflaeche.
- **Sichtbarer Spielwert:** Adressiert direkt das "drei orange Pills"-
  Click-Simulator-Gefuehl auf /game. Spieler sieht **seinen Charakter** als
  Hauptfigur links (Avatar gross, Forest-Spirit-Tag, Punkte als grosse
  Zahl), nicht drei gleich grosse Phasen-Buttons.
- **Stitch-Alignment:** Die linke Spalte im `der_waldtanz_game_board/screen.png`
  zeigt genau diesen Stats-Hero mit Avatar+Tag, dann 4 Nav-Items mit
  aktivem Lime-State. M7a ist die erste substantielle Annaherung an
  dieses Layout.

## Rein (was der Slice anfasst)

- `src/components/WaldtanzSeitenmenue.tsx` — neuer Sub-Block `__stats-hero`
  mit grossem Avatar + Tag + Punkte, ersetzt das schmale `__profil`.
- `src/components/WaldtanzSeitenmenue.tsx` — neuer Sub-Block `__stats-reihe`
  mit 3 Karten (Phase/Hand/Quest) als kompakte, gleich grosse Chips
  (kein orange-Ranking mehr).
- `src/components/WaldtanzSeitenmenue.tsx` — neuer Sub-Block `__nav-liste`
  mit 4 Pillen (Karte/Quest/Aufgaben/Waldwichtel-Tipps) auf /game immer
  sichtbar (nicht nur auf /). Aktiv-Lime statt Button-Look.
- `src/components/WaldtanzSeitenmenue.tsx` — neuer Sub-Block `__quest-fokus`
  mit aktiver Quest in 1 Zeile + Fortschritts-Zahl, uebernimmt die
  Quest-Information aus der Brettrand-Questpille (keine Doppelung, nur
  kompakte Zusammenfassung).
- `src/components/WaldtanzSeitenmenue.tsx` — neuer Props `aktiveRouteId` (default `'karte'`)
  und `aktiverQuestName` (default `''`).
- `src/App.tsx` — Props-Durchreichung an `<WaldtanzSeitenmenue>`.
- `src/App.css` — ~80 Zeilen CSS: `.waldtanz-seitenmenue__stats-hero`
  (Avatar 56x56, forest-container-bg, 3px border, hard-shadow-sm),
  `.waldtanz-seitenmenue__stats-reihe` (3 Chips, kompakt),
  `.waldtanz-seitenmenue__nav-liste` (4 Pills mit lime-active State,
  hover-lift), `.waldtanz-seitenmenue__quest-fokus` (lime-bg Pille mit
  progress). Reduced-Motion-Override + Cascade-Comments.

## Raus (was der Slice NICHT anfasst)

- **Engine** (`src/engine/**`) — keine Logik, keine Tests, keine Konstanten.
- **Layout-Grid** der Spielflaeche — Arenastein, Schlangenlichtung,
  Brettrand bleiben unveraendert.
- **WaldtanzBrettrandQuestpille** (M2g) — bleibt als Brettrand-Pille
  erhalten, M7a liefert nur eine kompakte Zusammenfassung links.
- **Spielerfuehrung** / **WaldtanzArenazug** / **Schlangenbereich** —
  andere Komponenten, andere Slices.
- **Lobby-Sonniges-Nest** — bekommt die neue Stats-Hero auch (sie ist
  nicht route-scoped), aber keine Storyline.
- **Click-Simulator-Hotspots** wie Kartenpop-Tooltip, Kompass-Heading
  (M1dn) — separate Slices.
- **Waldwichtel-Begleitung** (M7b-Kandidat) — separater Slice.

## RED-Tests (M7a:1 — M7a:10)

1. **M7a:1 — CSS-Source Stats-Hero Container** mit lime-bg,
   3px waldgruen-Border, hard-shadow-sm
2. **M7a:2 — CSS-Source Avatar gross 56x56**, rund, mit Border
3. **M7a:3 — CSS-Source Stats-Reihe 3 Chips** gleich breit, lime-bg,
   keine orange-Ranking-Farbe mehr
4. **M7a:4 — CSS-Source Nav-Liste 4 Pills** mit `--aktiv`-Variante in lime
5. **M7a:5 — CSS-Source Quest-Fokus Pille** lime-bg, Rubik-Black-Heading,
   progress-Anzeige
6. **M7a:6 — DOM Stats-Hero rendert** `<section aria-label="Stats">`
   auf /game mit Avatar + Name + Punkten
7. **M7a:7 — DOM Nav-Liste 4 Items** auf /game sichtbar mit aktiver
   Karte-Pille (lime-bg)
8. **M7a:8 — DOM Quest-Fokus zeigt aktiven Quest-Namen**, nicht
   Brettrand-Inhalt dupliziert
9. **M7a:9 — Pre-existing aria-label-Vertrag** (`Waldtanz-Spielrahmen`
   bleibt erhalten + `Spielprofil` migriert zu `Stats`)
10. **M7a:10 — package.json smoke:production enthaelt M7a-Skript**

## Smoke-Skript

`scripts/m7a_waldtanz_spieler_hero_smoke.mjs`:

- Live gegen `https://schlangentanz-v2.vercel.app/game` (nach Deploy).
- `sichtInfo(el)`-Helper (M1dn/M2e-Pattern): boundingBox + display.
- Assertions: `<aside aria-label="Waldtanz-Spielrahmen">` ist sichtbar,
  `<section aria-label="Stats">` hat Avatar 56x56 + lime-bg,
  4 Nav-Pills mit aktiver lime-bg, Quest-Fokus sichtbar, **KEINE**
  3 grossen orange Pills mehr.
- Self-Test-Modus vorhanden.

## Gate-Sequenz

1. RED-Tests (1 Vitest-Lauf mit `npx vitest run src/App.m7a_*.test.tsx`)
2. `npm run typecheck`
3. `npm run lint`
4. `npm run build`
5. `git diff --check`
6. Kimi Code CLI Review (`kimi -p "<brief>"`, Reviewer-Watchdog ist OK)
7. `git add` + Commit (Deutsch)
8. `git push origin main`
9. `bash ~/.hermes/skills/schlangentanz-workflow/templates/deploy_prod.sh`
10. Live-Smoke gegen Production-URL
11. `docs/release_status_2026-06-29_m7a.md` mit Gates-Tabelle,
    Kimi-Disclosure, Spielerische-Wirkung, Naechste-Luecke

## Vor-Implementation-Audit

- `rg -n "Waldtanz-Spielrahmen\|Waldtanz-Kompass\|Spielprofil" src/` — pre-existing
  aria-labels, die migriert werden muessen.
- `rg -n "waldtanz-seitenmenue__\|seitenmenue__rankenchip" src/App.css`
  — pre-existing CSS-Klassen, die wir umgehen oder erweitern.
- `rg -n "Spielprofil\|Waldtanz-Kompass" src/App.*.test.tsx` — pre-existing
  Tests, die wir im selben Slice migrieren (aria-label-Drift).

## Budget-Schaetzung

- RED-Test-File: ~150 Zeilen, 1 Call
- Component-Patch: ~80 Zeilen Diff, 1-2 Calls
- CSS-Block: ~80 Zeilen, 1 Call
- Targeted-Run + Migrations: 2-3 Calls
- Typecheck/Lint/Build: 3 Calls
- Smoke-Script: 1 Call
- Commit + Push + Deploy: 3 Calls
- Live-Smoke + Release-Doku: 2-3 Calls
- **Gesamt: ~15 Calls** (deutlich unter dem 30-Call-Cap fuer mittlere Slices)

## Naechste Luecke nach M7a

- **M7b** — Waldwichtel-Figur als Brettrand-Begleiter (neues
  Identitaets-Element oben Mitte neben Toad-King).
- **M7c** — Kartenpop-Tooltip als dezenter Stitch-Toast (oben rechts,
  Auto-Dismiss).