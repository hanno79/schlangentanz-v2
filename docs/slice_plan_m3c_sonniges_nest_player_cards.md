# M3c — Sonniges Nest Player-Cards (Stitch-Avatare)

**Slice-ID:** M3c
**Datum:** 2026-06-28
**Klasse:** M3-Lobby-Family (Erweiterung von M3a/M3b). Visuell + strukturell
(zweite Stufe nach M3b, vor dem nächsten Engine-/Spielmoment-Slice).
**Vorgänger:** M3a (Sonniges Nest beleben — Codeschild + Slots + Host-Badge
+ Play-Icons), M3b (Spielstart-Tanz — Start-Buttons Stitch-Stil + Slide-In).
**Autor:** Hermes (autonomer Cron-Lauf).

## Problem (mit Beweisen)

Nach M3a + M3b ist das Sonnige Nest auf `/` ein **funktionierender
Spielstart**, aber die Spieler-Slots sind visuell noch zurückhaltend:
eine horizontale auto-fit-Liste mit kleinen 96×96-Avatar-Kreisen
(`lobby-slot__hoehle`), Emoji als Avatar und einem schlichten Pillen-Label.

Stitch-Referenz `/tmp/schlangentanz_stitch_design/stitch/das_sonnige_nest_lobby/code.html`
zeigt die Lobby als **echten Spielstart mit Avatar-Heroes**:
- 128×128 px runde Avatare mit 3px Dark-Forest-Border + Hard-Shadow
- 2×2 Grid-Layout (nicht horizontal)
- Baumstamm-Rahmen (`bg-surface-variant`, `border-[3px] border-inverse-surface
  rounded-[4rem]`, `shadow-[0px_12px_0px_0px_rgba(6,57,7,1)]`)
- Vines/Leafs als Dekoration (lime Quarter-Circle top-left, mint
  Quarter-Circle bottom-right)
- Name-Pill unter jedem Avatar mit eigener Border + Shadow
- Empty-Slot mit `pulse-hollow` Animation und `person_add`-Icon

**Aktueller Zustand (gegen M3a/M3b, ohne M3c):**
- 96×96 px Avatare (zu klein für echte Personality)
- Horizontale Liste (max 4 Cards nebeneinander, alle gleich klein)
- Kein Baumstamm-Rahmen um die Slot-Sektion
- Keine Vines/Leafs
- Emoji statt visueller Avatar-Charaktere
- Kein "Difficulty"-Hinweis auf KI-Cards

**Konsequenz:** Die Lobby fühlt sich wie eine simple Button-Liste an,
nicht wie der Samstagsmorgen-Waldspielplatz, den Stitch verspricht.
"Click-Simulator"-Risiko: das Stitch-Bild wird nur halb geliefert.

## Lösungsansatz (mittlerer Vertical Slice, ~160 Zeilen)

M3c erweitert das Sonnige Nest zu einem **echten Avatar-Spielstart-Screen**:

1. **Spieler-Slots auf 2×2 Grid umstellen** (Stitch-Pattern, statt auto-fit
   horizontal). Vier Slots: Host (Mensch), Orange Crush (KI 1, aktiv),
   Lime Loop (KI 2, aktiv), Berry Boa (KI 3, aktiv). Bei 1 oder 2 aktiven
   KIs sind die freien Slots wartend.
2. **Avatare als SVG-Schlangen-Charaktere** statt Emoji. Drei Charaktere
   (Orange Crush = orange Schlange mit grünen Streifen, Lime Loop = hellgrüne
   Schlange, Berry Boa = magenta Schlange mit Beeren-Punkten) plus Host
   als smaragdgrüne Schlange mit Explorers-Hut. SVG inline in TSX.
3. **Baumstamm-Rahmen** um die Slot-Sektion: `bg-surface-variant`,
   `border-[3px] border-inverse-surface`, `rounded-[4rem]`,
   `shadow-[0px_12px_0px_0px_rgba(6,57,7,1)]` (analog zum Stitch-Baumstamm).
4. **Vines/Leafs Dekoration**: zwei Quarter-Circles (lime top-left, mint
   bottom-right) als `::before` / `::after` Pseudo-Elements auf
   `.lobby-baumhaus` (existieren bereits als small versions; M3c vergrößert
   und schiebt sie an die echten Baumstamm-Ecken).
5. **Name-Pill unter jedem Avatar**: Stitch-Pattern `font-body-lg
   text-body-lg text-inverse-surface bg-surface px-4 py-1 rounded-full
   border-2 border-inverse-surface shadow-[0px_2px_0px_0px_rgba(6,57,7,1)]`.
6. **Difficulty-Hinweis** auf KI-Cards als kleine Pille: "leicht" / "mutig"
   / "fies" (kein Engine-Touch — nur visueller Hinweis, dass KIs
   verschiedene Stärken haben).
7. **Avatar-Größe von 6rem auf 8rem** erhöhen (Stitch hat `w-32 h-32`).
8. **Reduced-Motion Override** für die Avatar-Slide-In-Animation bleibt
   erhalten (M3b-Vertrag).

### Rein

- `src/components/SonnigesNestLobby.tsx`: SVG-Avatare (4 Stück, inline
  ~24 Zeilen), Difficulty-Pille (~6 Zeilen), Baumstamm-Rahmen-Klasse
  hinzufügen, Slots-Layout auf 2x2 Grid umstellen.
- `src/App.css`: `.lobby-spieler-grid` (NEU, 2x2 grid), `.lobby-avatar`
  (NEU, 128x128 Kreis mit 3px Border + Hard-Shadow), `.lobby-baumhaus`
  (Anpassung: größerer Hintergrund + 4rem rounded + 12px Shadow),
  `.lobby-baumhaus::before/::after` (vergrößert), `.lobby-slot__name`
  (NEU, Name-Pill), `.lobby-slot__difficulty` (NEU, Difficulty-Pille).
- `src/App.m3c_sonniges_nest_player_cards.test.tsx` (NEU, 9-11 RED-Tests).
- `scripts/m3c_sonniges_nest_player_cards_smoke.mjs` (NEU, ~140 Zeilen).
- `package.json`: `m3c_sonniges_nest_player_cards_smoke.mjs` in
  `smoke:production`-Kette am Ende einfügen.

### Raus

- **Engine-Logik** unverändert. Keine Änderung an
  `erstelleEinzelspielerSpielzustand` / `starteAusspielphase`.
- **M3a / M3b Verträge** bleiben erhalten (Code-Schild-Sway, Slot-Pulse,
  Start-Button-Stil, Slide-In-Animation, KI-Logik).
- **Keine** Änderung am KiZugBuehne-Vertrag auf /game.
- **Keine** Avatar-Bilder aus dem Internet (SVG inline, offline-fähig).
- **Keine** Änderung am SonnigesNestLobby-Props-Interface
  (`aktiveKiGegner`, `onNeuesSpiel` bleiben).

## RED-Tests (vor Implementierung, gegen clean HEAD)

`src/App.m3c_sonniges_nest_player_cards.test.tsx`:

1. **Slots rendern als 2x2 Grid** — `.lobby-spieler-grid` hat
   `grid-template-columns` mit 2 Spalten (mobile: 1 Spalte).
2. **Avatare sind 128x128 px mit 3px Border + Hard-Shadow** — CSS-Source
   `.lobby-avatar { width: 8rem; height: 8rem; border: 3px solid
   var(--st-color-border-strong); box-shadow: 0 4px 0
   var(--st-color-border-strong); }`.
3. **4 Avatare sichtbar** — Host (Slippy Host) + 3 KI-Slots (Orange Crush,
   Lime Loop, Berry Boa), als SVG (kein Emoji als Avatar-Content).
4. **SVG-Avatare haben einen fill-Color** für den Schlangen-Kopf
   (orange/lime/magenta/forest-grün je nach Slot).
5. **Baumstamm-Rahmen** — `.lobby-baumhaus` hat jetzt
   `border-radius: 4rem` und `box-shadow: 0 12px 0
   var(--st-color-border-strong)`.
6. **Vines/Leafs als ::before/::after vergrößert** — 12rem Größe statt 9rem,
   lime Quarter-Circle top-left, mint Quarter-Circle bottom-right.
7. **Name-Pille unter Avatar** — `.lobby-slot__name` ist sichtbar mit
   `bg-surface`, `border-2 border-inverse-surface`, abgerundet.
8. **Difficulty-Pille nur auf KI-Slots** — `.lobby-slot--ki` hat
   `.lobby-slot__difficulty` Pille mit Text "leicht" / "mutig" / "fies"
   (Host-Slot hat KEINE Difficulty-Pille).
9. **Klick aktiviert weitere KI-Slots weiterhin** — bestehender M3a/M3b-
   Vertrag: Klick auf "Waldparty" aktiviert 2 KI-Slots mit Slide-In-
   Animation (M3c-Vertrag bleibt erhalten).
10. **Reduced-Motion respektiert** — `.lobby-avatar` Animation wird im
    reduced-motion-Block abgeschaltet (analog zu .lobby-slot--ki).
11. **M3a/M3b-Verträge bleiben grün** — kein Vertrag bricht
    (Host-Badge, Code-Schild-Sway, Start-Button-Stil).

## RED-Tests Smoke-Wiring

`src/App.m3c_smoke_wiring.test.ts` (4 RED-Tests, parallel zum M3b-Muster):

1. Smoke-Script existiert in `scripts/m3c_sonniges_nest_player_cards_smoke.mjs`.
2. `package.json` `smoke:production` enthält den Smoke-Pfad.
3. Smoke-Script enthält `BASE_URL`-Konstante und `messeLobby()`-Helper.
4. Smoke-Script prüft Avatar-Anzahl >= 4, 2x2-Grid, Baumstamm-Shadow,
   Name-Pille sichtbar.

## Vor-Implementation-Audit

```
grep -nE "lobby-(avatar|spieler-grid|slot__name|slot__difficulty)" src/  → 0 Treffer
grep -nE "Schwierigkeit|ki-staerke|difficulty" src/engine/               → 0 Treffer
grep -n "lobby-slots" src/components/SonnigesNestLobby.tsx              → 1 Treffer (zu ersetzen)
```

## Smoke-Script (Browser)

`scripts/m3c_sonniges_nest_player_cards_smoke.mjs` beweist im echten Browser:

- 4 `.lobby-avatar`-Elemente gerendert
- 2x2-Grid: `gridTemplateColumns` enthält 2 identische Spalten-Werte
- Avatar-Größe >= 100x100 px
- Baumstamm-Shadow: `box-shadow` enthält `12px` und einen Hex-Farbwert
- Name-Pille sichtbar mit "Slippy Host", "Orange Crush", "Lime Loop",
  "Berry Boa" als Text
- 3 Difficulty-Pillen mit den Texten "leicht", "mutig", "fies" sichtbar
- Klick auf "Waldparty" aktiviert 2 KI-Cards (bestehender M3b-Vertrag)
- Console-Errors: 0, Page-Errors: 0

## Kimi-Disclosure (geplant)

**REVIEWER=kimi-cli** (Codex OAuth usage limit aktiv bis 25.06.2026 19:07 UTC).
Kimi review-only, ~2-4 Min Bearbeitungszeit.

## Workflow

1. RED-Tests schreiben (`App.m3c_sonniges_nest_player_cards.test.tsx` +
   `App.m3c_smoke_wiring.test.ts`).
2. Targeted-Run: 2 RED-Pass-Iterationen (CSS fehlt, dann da).
3. SonnigesNestLobby.tsx anpassen: SVG-Avatare, Difficulty-Pille,
   neue Grid-Struktur.
4. App.css erweitern: ~120 Zeilen CSS.
5. Full-Suite + Typecheck + Lint + Build.
6. Kimi-Review (background, notify_on_complete).
7. Commit + Push + Deploy.
8. Live-Smoke gegen Production.
9. Release-Status-Doku.

## Acceptance Criteria

- Alle 11 RED-Tests grün.
- Full-Suite Net-Positive (0 neue Failures).
- Production-Smoke grün (alle 7 Asserts).
- `/` zeigt Stitch-inspirierte 2x2-Avatar-Grid-Lobby mit Baumstamm-Rahmen.
- Bestehende M3a/M3b-Verträge bleiben erhalten (keine Regressions).
- Code-Review: Kimi CLI 0 Blocker (oder dokumentierte Resolution).
