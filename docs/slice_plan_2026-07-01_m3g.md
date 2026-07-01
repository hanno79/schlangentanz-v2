# M3g — Sonniges-Nest-Lobby-Reinigung (Lobby-First-Erstbild)

**Datum:** 01.07.2026
**Slice-Klasse:** M-Visual-Consolidation (M-1dm/M1dn/M1do-Familie) + Affordance-Promotion (M1ds-ähnlich).
**Klassen-Audit (Pitfall #45):** Echte DOM-Klassen verifiziert via rg:
- `app-shell` (App.tsx Z. 294) — base + `app-shell--game` Modifier
- `sonniges-nest` (SonnigesNestLobby.tsx Z. 127) — Lobby-Container
- `lobby-baumhaus`, `lobby-spieler-grid`, `lobby-startreihe`, `lobby-startbutton` (App.css Z. 211, 270, 370, 377)
- `spielbereich` (App.tsx Z. 306) — der gesamte Game-Tree
- `hero` (App.tsx Z. 297) — Page-Title
- `schlangenbuch` (SonnigesNestLobby.tsx Z. 192) — Rules-Buch im Lobby-Tree

## Problem (Visuelle Bestandsaufnahme via Live-Probe)

Auf `https://schlangentanz-v2.vercel.app/` (Lobby/Default-Route):
- `body.scrollHeight` = **9139 px** (Viewport 900 px → 10x so hoch wie sichtbar)
- Hero bei y=31-148 (OK, sichtbar)
- `sonniges-nest` Lobby bei y=170-1771 (teilweise sichtbar)
- `lobby-baumhaus` endet bei y=**902** — die 4 Spieler-Slots sitzen bei y=515-860 (sichtbar)
- `lobby-startreihe` mit den 3 Start-Buttons (Duell/Waldparty/Große Runde) sitzt bei y=**929-990** — **UNTER dem 900-px-Falz**
- `schlangenbuch` bei y=1017-1737 (auch unter dem Falz)
- `spielbereich` (Game-Tree) bei y=**1794-9108** — 7314 px Game-Tree gerendert, obwohl der User auf der Lobby ist

**User-Erfahrung heute:** Der User landet auf `/`, sieht oben einen sauberen Hero + die ersten 2 Spieler-Slots vom Baumhaus, und muss scrollen um die Start-Buttons zu finden. Wenn er dann "Start" klickt, passiert visuell fast nichts Sichtbares (URL bleibt `/`, der ganze Game-Tree ist eh schon da, nur die Brettschritt-Liste füllt sich langsam). Das wirkt wie ein **kaputter Button** ("Klick und nichts passiert sichtbar"), nicht wie ein Spiele-Start.

## Stitch-Referenz

`/tmp/schlangentanz_stitch_design/stitch/das_sonnige_nest_lobby/code.html` zeigt:
- Großer, zentrierter **"Start Game"**-Button UNTER den 4 Player-Cards
- KEIN Game-Tree auf der Lobby (kein Hand-Panel, kein Spielfeld, keine Debug-Sektionen)
- Klare Stitch-Box mit sichtbaren 4 Player-Cards (1 Host + 3 wartende)

**Lücke:** Start-Button unter Falz + Game-Tree rendert unter Lobby.

## Rein

1. **CSS-Regel `.app-shell:not(.app-shell--game) #spielbereich { display: none }`** — auf der Lobby-Route den gesamten 7314-px-Game-Tree ausblenden. Auf `/game` bleibt alles sichtbar (kein `--game`-Modifier auf `app-shell`, also greift `:not()` nicht).
2. **CSS-Regel `.lobby-baumhaus { min-height: 0 }` + `.lobby-spieler-grid { gap: 0.75rem }`** — die Spieler-Cards kompakter machen, damit die `lobby-startreihe` mit y ≤ 900 in den Viewport rutscht.
3. **Kleines `<SpielPreview>`-Element** (neue Mini-Komponente) zwischen `lobby-baumhaus` und `lobby-startreihe` — eine 2-Zeilen Stitch-Pille ("Nach dem Start: Handkarten unten, Schlangen wachsen, Aufgaben lösen"). So bekommt der User nach dem sauberen Lobby-Bild einen sichtbaren Vorgeschmack auf das Spiel, BEVOR er startet. Rein informativ, keine Engine-Interaktion.

## Raus

- **KEINE** Engine-Änderungen (kein neuer `useState`, keine neuen Hooks in App.tsx)
- **KEINE** Änderung am `SonnigesNestLobby` selbst (nur im Layout/CSS drumherum)
- **KEINE** Änderung an der `lobby-startreihe` Button-Logik (klickt weiter `onNeuesSpiel`)
- **KEINE** `AktionenPanel`-Sichtbarkeitsänderung auf `/game` (das `display: none` greift nur auf `/`)
- **KEINE** neue Navigation/Routing-Logik (kein "Start → pushState('/game')") — der User bleibt auf `/`, das Spiel startet im selben Tree. Das ist absichtlich (kein SPA-Router, einfacher State-Reset via `setZustand(starteAusspielphase(erstelleSpielzustand(kiGegner+1)))`)

## Geometrie-Arithmetik (Ziel)

Vor M3g: `body.scrollHeight = 9139 px` (10.2× Viewport)
Nach M3g: `body.scrollHeight = ca. 1000-1100 px` (1.1-1.2× Viewport)
- Hero: y=31-148 (117 px)
- `sonniges-nest` Lobby-Box: y=170-1000 (830 px — Start-Buttons jetzt sichtbar)
  - Lobby-Code-Schild: y=190-300 (110 px)
  - `lobby-baumhaus`: y=320-820 (500 px) — kompakter
    - H2 + Status: 80 px
    - 4 Spieler-Cards: ~300 px (kompakter mit `gap: 0.75rem`)
  - `SpielPreview` (NEU): y=830-870 (40 px — 1 Zeile Pille)
  - `lobby-startreihe`: y=880-940 (60 px — jetzt sichtbar)
  - `schlangenbuch` ausgeblendet auf `/` (verschoben oder `display:none` auf `/`)
- `spielbereich` auf `/` komplett `display: none`

**Lobby-Preview-Text (1 Zeile):** "Bereit für Handkarten · Schlangen wachsen · Aufgaben lösen"

## RED-Tests (6 Tests in `src/App.m3g_lobby_erstbild.test.tsx`)

1. **CSS-Source-Assert:** App.css enthält `.app-shell:not(.app-shell--game) #spielbereich { display: none }`-Regel (last-match, exakt).
2. **CSS-Source-Assert:** App.css `.lobby-baumhaus` (oder `.lobby-spieler-grid`) hat kompaktere `gap`/`min-height`-Regel, die die `lobby-startreihe` in den Viewport bringt (z.B. `gap: 0.75rem` oder kleiner).
3. **DOM-Assert:** Auf `/` rendert `screen.getByRole('region', { name: 'Das sonnige Nest' })` mit 3 sichtbaren Start-Buttons im Viewport (`getBoundingClientRect().y + height < 900`).
4. **DOM-Assert:** Auf `/` ist `#spielbereich` im DOM aber `display: none` (per CSS-Source, nicht `getComputedStyle` wegen jsdom-Falle).
5. **DOM-Assert:** Auf `/game` ist `#spielbereich` sichtbar (kein `display: none`-Override greift, weil `app-shell--game` Modifier gesetzt).
6. **CSS-Source-Assert:** `.app-shell:not(.app-shell--game) .schlangenbuch` Regel (oder `.lobby-schlangenbuch`) blendet `Schlangenbuch` auf `/` aus, damit das Lobby-Erstbild fokussiert bleibt.

## Akzeptanz-Kriterien (Production-Smoke)

- `https://schlangentanz-v2.vercel.app/` @ 1280x900:
  - `body.scrollHeight` < 1100 px (vorher 9139 px) — **Netto-Verbesserung um Faktor 8+**
  - 3 Start-Buttons im Viewport sichtbar (y < 900)
  - `lobby-baumhaus` kompakt (Höhe < 600 px)
  - 0 Page-/Console-Errors
- `https://schlangentanz-v2.vercel.app/game` @ 1280x900:
  - Unverändert: `body.scrollHeight` ≥ 6000 px (volles Game-Layout)
  - Spielfeld + Hand + Schlangenlichtung sichtbar
  - 0 Page-/Console-Errors
- `npm test -- --run` zeigt **keine neuen** Failures (Baseline-Diff via Pitfall #20).

## Geschätzter Tool-Aufwand

~30-40 Tool-Calls (Claude-Code-Implementation + Smoke + Codex-Review + Doku).
Slice-Familie: M-Visual-Consolidation + Affordance-Promotion. Comparable to M3a-M3f (30-50 calls).
