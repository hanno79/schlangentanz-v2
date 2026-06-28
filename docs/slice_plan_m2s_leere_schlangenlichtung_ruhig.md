# M2s — Schlangenlichtung-Empty-State als ruhige Forest-Lichtung

**Slice-ID:** M2s
**Datum:** 2026-06-27
**Klasse:** M2-Visual-Consolidation (Erweiterung der M2r-Reihe)
**Autor:** Hermes (autonomer Cron-Lauf)
**Reviewer:** Kimi Code CLI (Codex OAuth `NOT_FUNCTIONAL`)

## Problem (mit Beweisen)

Nach M2r ist die Schlangenlichtung als Forest-Arena befreit (71% Viewport auf 1280x900). Aber im **leeren Anfangszustand** (Spieler hat noch keine eigene Schlange, keine Handkarte gewaehlt) stapeln sich in der grossen leeren Schlangenlichtung weiterhin mehrere Notification-/Info-Bubbles, die das "Click-Simulator-Gefuehl" verstaerken statt zu loesen.

Live-Probe Post-M2r am 2026-06-27 (`/tmp/probe_m2s_1280x900.png`, Screenshot vorhanden):

```
Schlangenlichtung @ 974x640 px, y=177
├── AktiverTanzSchritt       @ y=216  (894 px breit, "Spieler 1 ist am Zug")
├── Schlangen-Zielkompass    @ y=505  (491 px breit, "Waehle oder ziehe eine Handkarte...")
├── Schlangen-Startgarten    @ y=552  (Text-Bubble "Noch keine eigene Schlange")
├── Schlangen-Wertungsplakette @ y=84  (Ueberlagert Solo-Schlange rechts)
└── Brettschritt-Stempel     @ y=320  ("AUSSPIELPHASE"-Pill)
```

**Konsequenz:** Die leere Schlangenlichtung sieht aus wie ein Dashboard mit 5 uebereinander gestapelten Notification-Cards, nicht wie eine ruhige Forest-Arena-Lichtung, die auf den ersten Spieler-Klick wartet.

## Stitch-Referenz

`/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/code.html` zeigt die leere Forest-Arena als **ruhige Wiese** mit nur 3 sichtbaren Brettobjekten:
- zentrale Magiekreise (Startkreis / Schlangenende / Sonderzauber) als 3 Bubbles
- Handkarten-Faecher unten (ausserhalb der Arena)
- End-Turn-Pille unten-rechts

Keine Notification-Stacks, keine Info-Bubbles, kein Brettschritt-Text. Der Wald ist der Wald.

## Loesungsansatz (mittlerer Vertical Slice)

**Drei route-scoped Hides**, die die leere Schlangenlichtung von 5 Notification-Bubbles auf 1 zurueckfuehren — nur die Magiekreise + Magiekreis-Hinweis bleiben sichtbar.

1. `.waldtanz-aktiver-tanz-schritt` im Schlangenlichtung-Overlay → **display: none** auf /game
   - Info lebt bereits in der Spieleruebersicht-Sidebar ("Spieler 1 ist am Zug") und im Brettrand-End-Turn-Bereich
   - Wenn aktiver Spieler Sonderkarte spielt und Highlight braucht, kommt der ueber M2a/M1dq (Zielspur-Pulse)
2. `.schlangen-zielkompass` Text-Bubble → **display: none** auf /game (NUR im leeren Zustand, kein Karte gewaehlt)
   - Info "Waehle eine Handkarte" lebt bereits in der Spielerfuehrung-Sidebar
   - Sobald eine Karte gewaehlt wird (Klasse `.schlangen-bereich--karte-ausgewaehlt`), wird die Bubble wieder sichtbar
3. `.schlangen-startgarten` Empty-Text → **display: none** auf /game
   - Info "Noch keine eigene Schlange" lebt bereits in der Spielerfuehrung ("Naechster Schritt: Waehle erste Handkarte + nutze Startkreis")
   - Die Magiekreise selbst bleiben sichtbar (Startkreis ist der sichtbare Hinweis)

**Schraenken / Bedingungen:**
- (1) AktiverTanzSchritt: bleibt auf / (Lobby) sichtbar, weil dort das Spiel-Hero den Status braucht
- (2) Zielkompass: nur im Empty-State unsichtbar; sobald eine Karte gewaehlt ist, kommt die Bubble mit "X Brettziele bereit" zurueck (das ist die wertvolle Info)
- (3) Startgarten: bleibt auf / (Lobby) sichtbar; auf /game uebernehmen die Magiekreise die Hinweis-Funktion

## Pre-Implementation-Audit

| Test-Datei | Was wird geprueft | Was passiert mit M2s? |
|------------|-------------------|------------------------|
| `App.m1cu_*.test.tsx` | `.waldtanz-aktiver-tanz-schritt` Selector existiert + Klassen-Logik | Basis-Regel bleibt unveraendert, route-scoped Hide ist additiv → **gruen** |
| `App.m1di_waldtanz_schlangenlichtung.test.tsx` | Schlangenlichtung-Konsolidierung, `<WaldtanzAktiverTanzSchritt>` ist gerendert | Klasse-Aufruf bleibt im JSX, nur visuell hidden → **gruen** |
| `App.m1h_waldtanz_zielkompass.test.tsx` | Zielkompass CSS + Chip-Logik | Basis-Regel + JSX bleibt unveraendert → **gruen** |
| `App.m1cd_waldtanz_startgarten.test.tsx` | Startgarten auf /game sichtbar | **MUSS migriert werden**: M2s-Test akzeptiert "Startgarten im DOM aber visuell display:none auf /game"; CSS-Box-Assert wird zu route-scoped Hidden-Assert |
| `App.m1dt_schlangenwurm_*.test.tsx` | Schlangenkarten als Creature | unveraendert, da Solo-Schlange in der Schlangenbereich-Komponente (nicht der Overlay) → **gruen** |

## Akzeptanzkriterien

1. App.css deklariert 3 route-scoped display:none-Regeln mit Specificity 0,2,0
2. Auf /game im Empty-State (kein Karte gewaehlt, keine eigene Schlange):
   - `.waldtanz-aktiver-tanz-schritt` hat `display: none` (computed style)
   - `.schlangen-zielkompass` hat `display: none` (computed style)
   - `.schlangen-startgarten` hat `display: none` (computed style)
3. Auf /game sobald eine Handkarte gewaehlt wird: `.schlangen-zielkompass` wird wieder sichtbar (Klasse `.schlangen-bereich--karte-ausgewaehlt` triggert die Sichtbarkeit zurueck)
4. Auf / (Lobby): alle 3 Elemente bleiben sichtbar (route-scoped Hide greift nicht)
5. Pre-Existing-Tests (m1cu, m1di, m1h, m1dt) bleiben gruen
6. m1cd-Test wird auf "Empty-State auf /game display:none" migriert
7. Live-Smoke auf Production: 1280x900 — Empty-State zeigt keine der 3 Bubbles; sobald Handkarte gewaehlt, kommt Zielkompass zurueck
8. Console/Page-Errors: 0

## Workflow (TDD)

1. Pre-Implementation-Audit (siehe oben)
2. RED-Tests schreiben: `src/App.m2s_leere_schlangenlichtung_ruhig.test.tsx` mit 8-10 REDs
3. CSS-Only-Implementation: 3 route-scoped display:none
4. m1cd-Test migrieren (Startgarten-Empty-State auf route-scoped Hidden umstellen)
5. Targeted-Run auf m2s + alle migrierten Tests
6. Pre-Existing-Isolation via `git stash -u && npm test -- --run && git stash pop`
7. Build + Lint + Typecheck
8. Live-Smoke post-deploy
9. release-status-MD + commit + push + deploy

## Risikoabschaetzung

- **Niedrig:** Wie M2r/M2e — reine CSS-only Additive-Hides, keine Engine-Aenderung
- **Kein Layout-Budget-Shift:** die 3 Bubbles nehmen zusammen ~80 px weg, die Schlangenlichtung hat davon nichts (sie war schon grosszuegig dimensioniert)
- **Pre-Existing-Test-Migration:** nur m1cd (Startgarten-Sichtbarkeit), 1 Test-Datei
- **Erwarteter Net-Effect:** +8 RED-Tests gruen, 0 neue roten Tests, Schlangenlichtung wird ruhiger