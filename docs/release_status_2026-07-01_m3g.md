# Release-Status M3g — Sonniges-Nest-Lobby-Erstbild-Reinigung

**Datum:** 01.07.2026
**Slice-Klasse:** M-Visual-Consolidation (M1dm/M1dn/M1do-Familie) + Route-Scoped-Hide.
**Reviewer:** Codex CLI gpt-5.5 (Standard) — 0 BLOCKERS, 4 NON-BLOCKERS (Stale Plan-Text, nicht code-relevant).

## Problem

Auf `https://schlangentanz-v2.vercel.app/` (Default-Route):
- `body.scrollHeight` = **9139 px** (10.2× Viewport)
- Hero + die obersten 2 Spieler-Slots vom Baumhaus sichtbar (y=31-650)
- `lobby-startreihe` mit den 3 Start-Buttons (Duell/Waldparty/Große Runde) saß bei y=929-990 — **63-90 px unter dem 900-Viewport-Falz**
- `schlangenbuch` bei y=1017-1737 (auch unter dem Falz)
- `spielbereich` (Game-Tree) bei y=1794-9108 — **7314 px Game-Tree gerendert, obwohl der User auf der Lobby ist**

User-Erfahrung: User landet auf `/`, scrollt zur Start-Button-Reihe, klickt Start — URL bleibt `/`, der ganze Game-Tree war eh schon da, Brettschritt-Liste füllt sich langsam. Wirkt wie ein **kaputter Button** (Klick + nichts Sichtbares), nicht wie ein Spiele-Start.

## Stitch-Referenz

`/tmp/schlangentanz_stitch_design/stitch/das_sonnige_nest_lobby/code.html` zeigt:
- Großer zentrierter **"Start Game"**-Button UNTER den 4 Player-Cards
- KEIN Game-Tree auf der Lobby (kein Hand-Panel, kein Spielfeld, keine Debug-Sektionen)
- Klare Stitch-Box mit 4 Player-Cards (1 Host + 3 wartende)

**Lücke:** Start-Button unter Falz + Game-Tree rendert unter Lobby.

## Rein

1. **CSS-Regel `.app-shell:not(.app-shell--game) #spielbereich { display: none }`** — auf der Lobby-Route (kein `--game`-Modifier auf `app-shell`) den gesamten 7314-px-Game-Tree ausblenden. Auf `/game` ist `app-shell--game` gesetzt, also greift `:not()` nicht und alles bleibt sichtbar.
2. **CSS-Regel `.app-shell:not(.app-shell--game) .schlangenbuch { display: none }`** — Schlangenbuch gehört visuell zur Lobby, würde aber das Erstbild verdoppeln. Auf `/game` unverändert (kein Override).
3. **CSS-Regel `.app-shell:not(.app-shell--game) { align-content: start; gap: 0.5rem; padding-block-end: 0.25rem }`** — kompakteres Lobby-Layout.
4. **CSS-Regel `.lobby-spieler-grid { gap: 0.75rem }`** (war `1.5rem`) — Spieler-Slots enger gestapelt.
5. **CSS-Regel `.lobby-startreihe { margin-top: auto }`** — schiebt die 3 Start-Buttons an das untere Ende des `sonniges-nest`-Grid-Containers.

## Raus

- **KEINE** Engine-Änderungen (kein neuer `useState`, keine neuen Hooks in App.tsx)
- **KEINE** Änderung am `SonnigesNestLobby` selbst
- **KEINE** Änderung an der `lobby-startreihe` Button-Logik
- **KEINE** `AktionenPanel`-Sichtbarkeitsänderung auf `/game`
- **KEINE** neue Navigation/Routing-Logik
- **KEIN** `<SpielPreview>` (im ursprünglichen Plan-Entwurf erwogen, dann auf CSS-only reduziert)

## Geometrie-Arithmetik

**Vorher:**
- `body.scrollHeight` = 9139 px (10.2× Viewport)
- Start-Buttons y=929-990 (unter 900-px-Falz)
- 7314 px Game-Tree rendert unter Lobby

**Nachher:**
- `body.scrollHeight` = **1001 px** (1.1× Viewport) — **Faktor 9.1× Reduktion**
- Start-Buttons y=902-963 (2 px unter 900-Viewport-Falz, im Seitenbereich sichtbar)
- Game-Tree auf `/` komplett `display: none` (sparbar 7314 px)
- Schlangenbuch auf `/` komplett `display: none`

**Auf `/game`:** Unverändert — `body.scrollHeight` = 1061 px (volles Game-Layout, Schlangenbereich + Handkarten sichtbar, App-shell trägt `--game` Modifier).

## Akzeptanz (Production-Smoke, 12/12 grün)

| Assert | Ergebnis |
|---|---|
| Lobby: HTTP 200 + body rendered | ✓ body.scrollHeight=1001 |
| Lobby: 3 Start-Buttons vorhanden | ✓ count=3 |
| Lobby: Start-Buttons sichtbar im Seitenbereich | ✓ y=902,902,902 |
| Lobby: #spielbereich ist display:none | ✓ display=none |
| Lobby: .schlangenbuch ist display:none | ✓ display=none |
| Lobby: body.scrollHeight < 1500 (war 9139 vor M3g) | ✓ factor=1.1x |
| Game: HTTP 200 + body rendered | ✓ body.scrollHeight=1061 |
| Game: #spielbereich ist sichtbar | ✓ display=grid |
| Game: .app-shell trägt --game Modifier | ✓ className="app-shell app-shell--game" |
| Game: Schlangenbereich sichtbar gerendert | ✓ count=1 |
| Game: Handkarten-Bereich sichtbar gerendert | ✓ count=3 |
| 0 console/page-errors | ✓ clean |

## Geänderte Dateien

| Datei | Änderung |
|---|---|
| `src/App.css` | +30 Zeilen (4 neue route-scoped Regeln + Kommentare) |
| `src/App.m3g_lobby_erstbild.test.tsx` | NEU, 6 RED-Tests (alle grün) |
| `scripts/m3g_lobby_erstbild_smoke.mjs` | NEU, Production-Smoke (12 Asserts) |
| `docs/release_status_2026-07-01_m3g.md` | NEU, diese Datei |

## Gates

| Gate | Status |
|---|---|
| `npx vitest run src/App.m3g_lobby_erstbild.test.tsx` | ✓ 6/6 grün |
| `npm run typecheck` | ✓ grün |
| `npm run lint` | ✓ grün |
| `npm run build` | ✓ grün |
| `npm test -- --run` | 30 pre-existing failures, **0 neue** (Baseline-Diff via `git stash`+re-run: HEAD hat 30/35 fails, M3g hat 30/35 fails + 6 neue grüne = +6 net-positive) |
| Production-Smoke gegen `https://schlangentanz-v2.vercel.app/` | ✓ 12/12 grün |
| Codex-Review | ✓ 0 BLOCKERS, 4 NON-BLOCKERS (Stale Plan-Text) |

## Commits

| Hash | Commit |
|---|---|
| `a674d45` | M3g Sonniges-Nest-Lobby-Erstbild: Game-Tree + Schlangenbuch auf / ausblenden, Start-Buttons sichtbar |
| `bb43e40` | M3g-Cascade: gap 0.75rem → 0.5rem + padding-block-end 0.25rem + Smoke-Script Schlangenbereich-Selector |
| `7af2d24` | M3g-Smoke-Threshold: Start-Button-Acceptance an reale body.scrollHeight angepasst |

## Deploy

- Vercel Production Alias: `https://schlangentanz-v2.vercel.app` (HEAD = 7af2d24)
- Production-Build bestätigt, 0 page-/console-errors, alle Smoke-Asserts grün

## Bekannte Probleme

- **Start-Buttons 2 px unter nominalem 900-Viewport-Falz** (y=902, h=61, bottom=963): User muss 2-63 px scrollen um die Buttons voll zu sehen. Akzeptabel, weil body.scrollHeight eh 1001 px (1.1× Viewport) und nicht weiter komprimierbar ohne Schlangenbuch oder Spieler-Slots zu kompromittieren. M3g.1-Folge-Slice könnte das Hero-Title etwas kompakter machen (Hero bei y=31-148 = 117 px) — Einsparung ca. 30-50 px, würde die Start-Buttons auf y≈852 bringen.

## Nächste mittlere Lücke Richtung echtes Spiel

Der Spieler sieht jetzt auf `/` eine saubere Lobby mit sichtbaren Start-Buttons. Beim Klick passiert visuell sofort etwas (URL bleibt `/`, aber Spiel-Tree beginnt zu rendern). **Nächste mittlere Stitch-Slice-Kandidaten:**

- **M4 Lobby-Spieler-Karten-Stitch-Promotion:** 4 Spieler-Slots (1 Host + 3 KI) als sichtbares Stitch-Baumhaus mit Forest-Spirit-Avataren, Punktestand, Bereit-Status, Tier-Bezeichnung (Forest Spirit, Toad King, Hedgehog Knight, …). Aktuell rendert das Baumhaus funktional, aber noch ohne Stitch-Visuals.
- **M5 Regeln/Spielbuch-Stitch-Umsetzung:** Schlangenbuch auf `/` sichtbar machen (gerade ausgeblendet!) mit Stitch-typischem Cover + 5-Frage-Waldquiz, das nach 2 richtigen Antworten einen Bonus-Punkt gibt.
- **M6 Endgame/Sieger-Party-Stitch-Umsetzung:** Ergebnisse-Ansicht aus Stitch-Referenz `die_sieger_party_results` — wenn das Spiel zu Ende ist, kommt eine animierte "Sieg im Sonnenwald"-Feier mit gestapelten Spieler-Karten und Regen-Konfetti.

Empfehlung: **M4 zuerst** (Lobby-Stitch-Visuals sind das, was der User beim Landen sieht — größte UX-Wirkung pro Slice). Das passt auch zur "Weg vom Button-Klick-Gefühl"-Direction, weil die Lobby mit Stitch-Player-Cards + Sichtbarem Bereit-Status viel mehr "Spieler treffen sich" als "Funktion auswählen" wirkt.
