# M3h — Stitch-Lobby-Avatar-Promotion (Schwierigkeit sichtbar pro Slot + Forest-Boden)

**Datum:** 01.07.2026
**Slice-Klasse:** M-Affordance-Promotion + Visual-Consolidation (M1ds/M3c-Familie). Sichtbares Stitch-Spieler-Treffen-Gefühl auf / statt "Klick-auf-Start-Button".
**Klassen-Audit (Pitfall #45):** Echte DOM-Klassen verifiziert via `rg -n "lobby-slot|sonniges-nest" src/`:
- `.lobby-slot` (App.css Z. 313) — Wrapper um Avatar + Name + Difficulty
- `.lobby-slot--host` (Z. 453) — Modifikator für Spieler-1-Slot
- `.lobby-slot--ki` (Z. 386) — Modifikator für aktive KI-Slots
- `.lobby-slot--wartet` (Z. 323) — Modifikator für leere Slots
- `.lobby-avatar` (Z. 328) — 8rem runder Avatar
- `.lobby-avatar__bild` (Z. 341) — SVG-Wrapper
- `.lobby-slot__name` (Z. 353) — Name-Pille unter Avatar
- `.lobby-slot__difficulty` (Z. 367) — Schwierigkeit-Pille (position: absolute top-right, derzeit AUSSERHALB des Avatars)
- `.lobby-slot__badge` (Z. 438) — existierende Badge-Klasse (für "DU" / "BEREIT!" wiederverwendbar)

## Problem (Visuelle Bestandsaufnahme via Live-Probe)

Auf `https://schlangentanz-v2.vercel.app/` (Default-Route, Stand nach M3g):
- 4 Spieler-Slots rendern in 2x2 Grid (M3c) mit Stitch-Avataren + Namen
- **Schwierigkeit-Badge (".lobby-slot__difficulty")** ist `position: absolute; top: 0.2rem; right: 0.4rem` — d.h. es schwebt **rechts oben neben dem Avatar im Slot-Container**, nicht direkt am Avatar. Im 2x2-Grid bedeutet das: die "MUTIG"-Pille des Orange-Crush-Slots sitzt zwischen den beiden Spalten, lesbar aber weit weg vom Avatar. Für Spieler-1 fehlt sie komplett (Host hat keine Schwierigkeit, logisch korrekt).
- **Host-Slot** ist visuell identisch zu KI-Slots (gleiche Avatar-Größe, gleiches Pille-Format). User weiß nicht "das bin ich" — das ist ein klassisches "Lobby ohne Identität"-Problem.
- **Wartende Slots** (`.lobby-slot--wartet`) zeigen den Text "wartet auf KI-Schlange" — viel zu lang für eine 8rem-Avatar-Box (Pille wird 144 px breit, ggf. mit `wartet` reicht "frei" oder "?"). Sieht eher nach Fehler-Meldung aus als nach "Platzhalter".
- **Kein sichtbarer Boden** unter den Avataren: Avatare schweben frei im lime-Baumhaus-Hintergrund. In der Stitch-Referenz (`/tmp/schlangentanz_stitch_design/stitch/das_sonnige_nest_lobby/code.html`) sitzen die Player-Cards auf kleinen sichtbaren Forest-/Sun-Tiles, was den "die treffen sich gerade"-Look verstärkt.

**User-Erfahrung heute:** "Vier grüne Schlangen-Kreise mit langen Texten drunter, in einem großen lime-Baumhaus. Ich bin einer davon? Welcher? Und die 2. Reihe wartet auf was? Schwer zu sagen."

**Stitch-Erfahrung gewünscht:** "Vier Player-Cards auf einem sonnigen Waldboden. Mein Slot hat ein 'DU'-Badge. Die anderen haben Schwierigkeit-Badges (mutig/listig/fies) DIREKT am Avatar. Die leeren Plätze haben ein dezentes 'frei'-Label."

## Rein

1. **`.lobby-slot__difficulty` als Inline-Element unter dem Avatar** (statt `position: absolute`). Sichtbar pro aktivem KI-Slot, klar zugeordnet, nicht mehr schwebend.
2. **Neue `.lobby-slot__host-badge` mit Text "DU"** (Forest-Spirit-Host-Markierung). Sichtbar **nur** auf `.lobby-slot--host`. Position: relative (im Flex/Grid-Flow unter dem Avatar), damit der Avatar-Container konsistent bleibt.
3. **Kürzerer Wartet-Text**: "wartet auf KI-Schlange" → "frei" (3 Zeichen statt 19, passt in eine Mini-Pille, sieht wie ein Platzhalter aus, nicht wie ein Fehler).
4. **Neuer `.lobby-slot__boden` — kleiner Forest-Tile-Streifen unter dem Avatar** (alle 4 Slots). 100% Breite, 0.7rem hoch, abgerundete Ecken, `--st-color-tertiary-container` Hintergrund. Sieht aus wie ein "Sonniger Waldboden" auf dem die Schlange steht.
5. **`.lobby-slot` bekommt `display: flex; flex-direction: column; align-items: center; gap: 0.4rem`** (statt `display: grid; justify-items: center`) — damit Avatar + Name + Difficulty + Host-Badge + Boden in einer sauberen vertikalen Spalte sitzen.
6. **M3c-Schwierigkeit-Bestehender-Vertrag bleibt**: `.lobby-slot__difficulty` muss weiterhin `border-radius: 999px; border: 2px solid` haben (RED-Tests in `m3c_sonniges_nest_player_cards.test.tsx` bleiben grün).

## Raus

- **KEINE** Engine-Änderungen (kein neuer `useState`, keine neuen Hooks in App.tsx)
- **KEINE** Änderung an `SonnigesNestLobby.tsx` JSX (nur CSS)
- **KEINE** Änderung an `lobby-baumhaus` (Layout drumherum bleibt)
- **KEINE** Änderung an `lobby-spieler-grid` (bleibt 2x2)
- **KEINE** Änderung an `lobby-startreihe` (Start-Buttons bleiben unverändert)
- **KEINE** Änderung am M3c- oder M3b-Vertrag (Slide-In-Animation, Difficulty-3-Stufen, Schwierigkeit-Texte)
- **KEINE** neuen SVG-Avatare (M3c-Avatare bleiben)

## Akzeptanz-Kriterien (6 RED-Tests)

1. **M3h:1** — `.lobby-slot__difficulty` ist `position: static` (nicht `absolute`) — Schwierigkeit-Pille fließt im Flex-Flow unter dem Avatar
2. **M3h:2** — Neue `.lobby-slot__host-badge` Klasse existiert in App.css mit `border-radius: 999px; border: 2px solid var(--st-color-border-strong); background: var(--st-color-tertiary-container)` (Stitch-Pill im Coral-Forest-Stil)
3. **M3h:3** — `.lobby-slot__boden` existiert mit `height: 0.7rem; background: var(--st-color-tertiary-container); border-radius: 0.4rem` (sichtbarer Forest-Boden-Streifen)
4. **M3h:4** — `.lobby-slot` ist `display: flex; flex-direction: column; align-items: center` (vertikale Spalte, zentriert)
5. **M3h:5** — Host-Slot rendert eine `.lobby-slot__host-badge` mit Text "DU" — sichtbar via DOM-Assert
6. **M3h:6** — Wartende Slots rendern Name-Pille mit Text "frei" (nicht "wartet auf KI-Schlange") — DOM-Assert

## Geometrie-Arithmetik

**Vorher (M3g-Stand):**
- 4 Slots in 2x2 Grid, je 353×159 px
- Avatare 8rem rund, Name-Pille darunter, Difficulty schwebt absolute top-right (manchmal außerhalb der sichtbaren Slot-Box)

**Nachher (M3h):**
- 4 Slots in 2x2 Grid, je 353×~190 px (etwas höher wegen Boden-Streifen + Host-Badge)
- Avatare 8rem rund, Name-Pille darunter, **Difficulty inline** unter Name-Pille, **Host-Badge** unter Name (nur Host), **Forest-Boden** ganz unten
- Slot y-Position: war 501-833 px (im 900-Viewport sichtbar), wird ca. 480-830 px (leicht nach oben verschoben, weil kompaktere Pille + Boden passt in Slot)
- Lobby-Baumhaus bleibt bei y=331-874 px
- Start-Buttons y=901-963 (wie M3g)

## Smoke-Asserts (Production, ~6 Asserts)

1. `/` HTTP 200, body rendered
2. 4 `.lobby-slot` Elemente vorhanden
3. Host-Slot (`.lobby-slot--host`) enthält `.lobby-slot__host-badge` mit Text "DU"
4. 3 aktive KI-Slots (`.lobby-slot--ki`) enthalten je 1 `.lobby-slot__difficulty` (NICHT position:absolute) — boundingBox der Difficulty-Pille ist **innerhalb** der Slot-Box
5. 2 wartende Slots (`.lobby-slot--wartet`) rendern Name mit Text "frei"
6. Alle 4 Slots haben sichtbaren `.lobby-slot__boden` (height >= 8px, y im Slot-Bereich)

## Bekannte Probleme / Trade-offs

- **Boden-Streifen erhöht die Slot-Höhe** um ~12-15 px. Aktuell ist die untere Slot-Reihe bei y=674-833 px. Mit Boden wird sie 674-848 px. Im 900-Viewport bleibt sie sichtbar (kein Falz-Cut). `body.scrollHeight` sollte von 1001 auf ca. 1015-1020 px wachsen.
- **Host-Badge** ist neu, deshalb gibt es einen kleinen vertikalen Versatz zwischen Host-Slot (1 Extra-Element) und KI-Slots (Difficulty statt Host-Badge). Sollte ok aussehen, weil Difficulty und Host-Badge beide Pill-Format haben.

## Nächste mittlere Lücke Richtung echtes Spiel

Nach M3h ist die Lobby visuell komplett: 4 Stitch-Spieler auf Forest-Boden, User weiß "DU" bist du, aktive KIs zeigen Schwierigkeit, leere Plätze sind dezent markiert. Das nimmt der Lobby das "Klick-auf-Funktion"-Gefühl. **Nächste sichtbare Lücke:** /game wirkt immer noch wie ein Brettspiel-Bedien-Panel (Quest-Pille + 4 Status-Chips + Schlangenlichtung-Banner + Handkarten-Leiste). Nächster M-Slice könnte M4 = "Waldtanz-Brett-Stitch-Hero-Promotion" sein: die zentrale Schlangenlichtung wird visuell dominanter (größer, mehr Forest-Detail), während die seitlichen Status-Chips noch kompakter werden. Aber das ist ein größerer Slice — empfehle M4 als Folge.
