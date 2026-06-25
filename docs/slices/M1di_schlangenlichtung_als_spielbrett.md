# M1di — Waldtanz-Schlangenlichtung als sichtbares Spielbrett-Raster

> **Status:** Geplant. Wartet auf freien Slot nach M1dh (Spielhandlung, 0b38fbc).
> **Typ:** Mittlerer Vertical (UI/UX, Layout + Affordance), kein Engine-Touchpoint.
> **Vorgänger:** M1dh (Brettrand-Spielpillen) + M1dg (Lichtungsstein) + M1df (Magiekreise).
> **Quelle:** User-Report 25.06.2026 + Production-Screenshot `/tmp/m1di_prod.png` + Stitch-Referenz `/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/screen.png`.

## Befund (warum dieser Slice nötig ist)

Vergleich Production `/game` (1280×900) mit Stitch-Referenz:

| Bereich | Production heute | Stitch-Referenz | Lücke |
|---|---|---|---|
| Arena-Mitte | 6 vertikal gestapelte Mini-Panels (Leuchtender Waldstein-Kopf, Questband, Aktiver Tanz Schritt, Brettschritt-Stempel, Tischkarte, Magiekreise) — wirkt wie Debug-Liste | Eine grosse gerundete Stein-Fläche als primary board surface | Schlangenlichtung muss als primary visual dominieren, nicht als wrapper-Panel |
| Schlangen-Reihen | Im innersten Schlangenbereich vergraben (`.schlangenbereich--waldlichtung > .schlangen-gruppe`), keine eigenen sichtbaren Rows / Cells | Sichtbare Karten-Reihen auf der Stein-Fläche | Schlangen brauchen sichtbare Cells/Reihen mit ablesbaren Farbbändern |
| Tischkarte + Magiekreise | Stapeln sich untereinander als eigene Boxen; Magiekreise liegen als kleine Pills neben der Schlangenlichtung | Ablage + Ziele sind *innerhalb* der Arena als kleine Pills auf der Stein-Fläche | Ablage/Questband/Magiekreise sollen als secondary overlays auf der Stein-Fläche sitzen, nicht als separate Top-Level-Panels |

### Sichtbares Spielwert-Ziel

Auf `/game` im 1280×900-Erstbild sieht der Spieler **eine einzige grosse Schlangen-Lichtung** (primary board surface) mit:

- **Eigene Schlange** als sichtbare farbige Karten-Reihe auf der Stein-Fläche (primary game object)
- **Gegner-Schlangen** darunter oder darüber als kleinere Reihen mit Spieler-Identität
- **Ablagestapel-Tischkarte** als kleines Overlay auf der Stein-Fläche (nicht mehr als Top-Level-Panel)
- **Magiekreise** (Sonderkarten-Ziele) als kleine Pills auf der Stein-Fläche (nicht mehr als separates Panel)
- **Questband** als dünne Statusleiste am oberen Rand der Stein-Fläche (nicht mehr als Box)
- **Aktiver Tanz Schritt + Brettschritt-Stempel** als Status-Bereich am unteren Rand der Stein-Fläche

Die bestehende Engine-Logik (legalActions, Sonderkarten-Ziele, Drag & Drop) bleibt **vollständig erhalten**. Nur das Layout wird umstrukturiert.

### Root-Cause (warum das Layout heute fragmentiert ist)

- Der aktuelle `waldtanz-arenastein__spielfeld` ist ein 2-Spalten-Grid (Schlangenlichtung + Waldobjekte) mit übergeordneten `<section>`-Boxen
- Jedes Sub-Panel (`WaldtanzQuestband`, `WaldtanzAktiverTanzSchritt`, `WaldtanzBrettschrittStempel`, `WaldtanzTischkarte`, `WaldtanzMagiekreise`, `Schlangenbereich`) hat **eigene** `kopf`/`h4`/`p`-Header, eigene Borders, eigene Backgrounds
- Die Schlangenlichtung ist heute nur ein Wrapper für den Schlangenbereich — sie hat keine eigene visuelle Identität als "Spielfläche"

### Warum nicht Mikro-Slice

Eine reine "1-Panel-Position-CSS-Fix"-Lösung würde das Fragmentierungs-Problem nicht lösen — die doppelten Header-Boxen bleiben sichtbar.

### Warum nicht Big-Bang

Ein vollständiger Layout-Rewrite würde die 6 bestehenden Sub-Panels komplett neu erfinden — zu viel Scope, zu viel Test-Refactoring. Wir behalten alle Sub-Panels als Komponenten, ändern aber **nur** ihre Position + Container innerhalb der Schlangenlichtung.

## Scope

### Rein

1. **Eine neue `WaldtanzSchlangenlichtung`-Komponente** (`src/components/WaldtanzSchlangenlichtung.tsx`, ~120 LoC) als primary board surface Container
   - Rendert Schlangen-Bereich (eigene + Gegner) als primary visual
   - Bettet Tischkarte, Magiekreise, Questband, Aktiver Tanz Schritt, Brettschritt-Stempel als **secondary overlays** auf der Stein-Fläche ein
   - Eine einzige `kopf`/`h4`/`p`-Header-Box für die ganze Lichtung
   - Eigene Klasse `waldtanz-schlangenlichtung__spielflaeche` für das primary grid

2. **Layout-Refactoring in `src/App.tsx`** (Zeilen 303–372):
   - Ersetze die 5+ direkten Sub-Komponenten-Aufrufe innerhalb `waldtanz-arenastein__schlangenlichtung` durch **einen** Aufruf der neuen `<WaldtanzSchlangenlichtung>`-Komponente
   - Behalte `WaldtanzTischkarte`, `WaldtanzKartenpop`, `WaldtanzMagiekreise`, `Schlangenbereich`, `WaldtanzQuestband`, `WaldtanzAktiverTanzSchritt`, `WaldtanzBrettschrittStempel` als Komponenten unverändert (nur ihr Container-Wechsel)

3. **CSS-Refactoring in `src/App.css`** (Erlaubnis-Scope):
   - Neue Klassen `.waldtanz-schlangenlichtung`, `.waldtanz-schlangenlichtung__kopf`, `.waldtanz-schlangenlichtung__spielflaeche`, `.waldtanz-schlangenlichtung__schlangen`, `.waldtanz-schlangenlichtung__overlays`
   - Entferne doppelte Borders / Headers aus `.waldtanz-arenastein__schlangenlichtung` und den Sub-Panels wo sie jetzt in der neuen Komponente zentralisiert sind
   - Position der Sub-Overlays (Questband oben, Aktiver Tanz Schritt unten, Magiekreise rechts, Tischkarte links) als `position: absolute` *innerhalb* der Stein-Fläche
   - Stein-Fläche bekommt `min-height: clamp(20rem, 50vh, 28rem)` und `aspect-ratio` so dass sie als primary surface visuell dominiert

4. **Neuer RED-Test** `src/App.m1di_waldtanz_schlangenlichtung.test.tsx` (~120 LoC):
   - Bestätigt: `waldtanz-schlangenlichtung` ist die primary visual region
   - Bestätigt: Schlangen-Bereich rendert innerhalb der neuen Komponente
   - Bestätigt: Questband / Aktiver Tanz Schritt / Brettschritt-Stempel sind Kinder der neuen Komponente (nicht mehr separate Top-Level-Panels)
   - Bestätigt: nur **eine** `<h4>` mit "Leuchtender Waldstein"-artigem Titel in der Schlangenlichtung (Konsolidierungs-Beweis)
   - CSS-Source-Test: neue Klassen vorhanden, doppelte Border-Deklarationen in Sub-Panels auf der Schlangenlichtung entfernt

5. **Smoke-Skript** `scripts/m1di_waldtanz_schlangenlichtung_smoke.mjs` (~120 LoC):
   - Verifiziert auf Production: Schlangenlichtung als primary sichtbare Region mit `getBoundingClientRect()` > 40% Viewport-Fläche
   - Verifiziert: nur **eine** Header-Box auf der Schlangenlichtung, nicht 5
   - Verifiziert: Schlangen-Reihe ist visuell präsent (sichtbare `.schlangekarte`-Elemente)
   - Verifiziert: keine console/page-Errors

6. **`package.json`-Update**: `smoke:production`-Kette erweitert um den neuen Smoke nach `m1dh` und vor `m3b`.

7. **Release-Doku** `docs/release_status_2026-06-25_m1di.md` mit Production-Smoke-Beweis und Stitch-Vergleichs-Notiz.

### Raus

- **Keine Engine-Änderung.** `legalActions`, `farbenschutzAktionen`, `farbenfusionAktionen`, `schlangenfrassAktionen` etc. bleiben unverändert.
- **Keine Schlangen-Komponenten-Änderung.** `Schlangenbereich`, `GegnerSchlangenListe`, `WaldtanzZielkompass`, `SchlangenPfadKarte`, `SchlangenStartzone` etc. bleiben byte-identisch.
- **Keine Sonderkarten-Ziel-Komponenten-Änderung.** `WaldtanzMagiekreise`, `FarbenfusionPaarziel`, `FarbenschutzSchild`, `SchlangenfrassBissspur`, `SchlangenblockadeFessel`, `SchlangengrubeGrubenfalle`, `FarbendiebBeutekorb` bleiben unverändert.
- **Keine Aktionen/Handkarten-Panel-Änderung.** Die Brettrand-Spielpillen aus M1dh bleiben unverändert.
- **Keine Farbgruppenband / Questband / Brettschritt-Stempel / Aktiver Tanz Schritt Komponenten-Änderung.** Nur ihr Container wechselt.

## Akzeptanzkriterien

### Sichtbar (Production-Verifikation)

- [ ] Im 1280×900-View auf `/game` ist die Schlangenlichtung visuell die größte Region nach dem Handkarten-Bereich (>= 40% Viewport-Höhe)
- [ ] Genau **eine** Header-Box mit "Leuchtender Waldstein"-artigem Titel auf der Schlangenlichtung (nicht 5–6)
- [ ] Schlangen-Reihen (eigene + Gegner) sind visuell klar erkennbar als primary game objects
- [ ] Magiekreise + Tischkarte + Questband + Brettschritt-Stempel + Aktiver Tanz Schritt erscheinen als secondary overlays **innerhalb** der Stein-Fläche (nicht als separate Top-Level-Panels darunter)
- [ ] Alle bestehenden Sonderkarten-Ziel-Affordances (Hover, Drag, Klick) bleiben funktional — Smoke klickt mindestens eine Magiekreis-Pille und prüft, dass `onAktion` durchgeht

### Technisch

- [ ] `npm run typecheck` ok
- [ ] `npm test -- --run` ok (alle bestehenden 1117+ Tests + neue RED-Tests grün)
- [ ] `npm run lint` ok
- [ ] `npm run check:test-lines` ok (alle Testdateien < 500 LoC, neue Komponente < 250 LoC)
- [ ] `npm run build` ok
- [ ] `git diff --check` ok
- [ ] `node scripts/m1di_waldtanz_schlangenlichtung_smoke.mjs` ok
- [ ] `node scripts/live_smoke.mjs` ok (keine Regressionen)
- [ ] `node scripts/m1dh_waldtanz_spielhandlung_smoke.mjs` ok (M1dh-Brettrand-Pillen unverändert)
- [ ] `node scripts/m1dg_waldtanz_lichtungsstein_smoke.mjs` ok (Lichtungsstein-Box konsistent)
- [ ] Vercel Production-Deploy READY
- [ ] Live-Smoke gegen https://schlangentanz-v2.vercel.app/game ok

### Engine-Regression

- [ ] `legalActions` Aufzählung bleibt identisch
- [ ] `karteAnlegenAktionen`, `neueSchlangeStartenAktionen`, `farbenschutzAktionen`, `farbenfusionAktionen`, `schlangenfrassAktionen`, `farbendiebAktionen` werden weiterhin vollständig gerendert (Smoke + Tests prüfen das)
- [ ] Drop-Zonen + Drag-Status bleiben unverändert

## Workflow

1. **RED**: Neue RED-Tests + neuer Smoke zuerst, alle FAIL auf aktuellem Stand
2. **GREEN**: Claude Code (`--model opusplan`) implementiert
3. **Simplify**: `/simplify`-Pass, dann Tests + Gates
4. **Review**: Kimi Code CLI Review (Codex rate-limited bis ca. 25.06.2026 19:07 UTC)
5. **Release**: Commit + Push + Vercel Deploy + Live-Smoke

## Kimi-Review-Pflicht (auto-selektiert via Watchdog)

Watchdog-Output aktuell: `REVIEWER=kimi-cli` (Codex RATE_LIMITED).
Review-Brief: Pattern-Exemplar aus `docs/release_status_2026-06-25_m1dh.md` +
aktuelle Diff inkl. untracked Dateien + Anweisung "do not commit, do not
push, do not deploy - only write the file/respond".

Reviewer-spezifische Pitfalls:
- Kimi K2.7 reproduziert Pattern-Strukturen mit ~10% Phrasing-Drift
  → vor Commit manuell auf Umlaut-Drift prüfen (deutsche Umlaute direkt,
  nicht ae/oe/ue/sz-Substitution)
- Kimi Output-Format: `<thinking>...• ...• ...To resume...` → letzten
  Bullet-Block nehmen

## Pitfalls

- **Schlangen-Bereich behält eigene Sub-Container.** Nicht versuchen, ihn
  in die neue Komponente hinein umzuschreiben — das bricht 40+ bestehende
  R/R-Tests. Nur der **Wrapper-Container** wechselt.
- **Magiekreise sind keine Top-Level-Box.** Sie werden heute als
  `<WaldtanzMagiekreise>` innerhalb der Schlangenlichtung gerendert. Die
  neue Komponente soll sie als Overlay *innerhalb* der Stein-Fläche
  positionieren, aber der bestehende `<WaldtanzMagiekreise>`-JSX bleibt.
- **Tischkarte nicht entfernen.** Sie ist Engine-Ablagestapel-relevant.
- **Header-Vereinheitlichung nur visuell.** Die einzelnen Sub-Komponenten
  dürfen weiterhin ihre internen `<h5>`/`<span>`-Header haben (für
  Screenreader), aber im sichtbaren Layout sollen sie unter EINEM
  Schlangenlichtung-Header stehen.
- **CSS-Source-Tests können Cascade-Bugs übersehen.** Smoke MUSS die
  computed styles / `getBoundingClientRect()` der Stein-Fläche prüfen.
- **Mobile responsive prüfen.** Die neue Schlangenlichtung muss auch
  bei < 768px Viewport-Breite noch bedienbar bleiben.