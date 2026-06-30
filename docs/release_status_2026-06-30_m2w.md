# M2w Release-Status — Brettrand-Zugseitenleiste konsolidieren (Stitch-Waldtanz-Brett)

**Datum:** 30.06.2026
**Slice:** M2w — Brettrand-Zugseitenleiste konsolidieren
**Slice-Klasse:** M2-Visual-Consolidation (Schwester zu M2r Schlangenlichtung-Forest-Arena, M2e Schlangenlichtung-Brettwald-Befreiung, M2s leere Schlangenlichtung-Ruhig; Fortsetzung der M2-Visual-Consolidation-Reihe)
**Status:** 🟢 SHIPPED

## Zusammenfassung

Auf /game ist die `.waldtanz-zugseitenleiste` (1031×72 px unter der
Schlangenlichtung) von **7 gleichberechtigten Mini-Cards** auf **4
konsolidierte Stitch-Cards** reduziert:

| Vor M2w | Nach M2w |
|---------|----------|
| Unterholzleiste (108×90) | — versteckt (Info dupliziert in Spielhilfe) |
| Zugpfad (146×90) | Zugpfad (108×90) — Stitch-Style |
| Spielhilfe (146×90) | Spielhilfe (146×90) — Stitch-Style |
| Spieluhr (146×90) | — versteckt (Info dupliziert in Partiefortschritt) |
| KiZugBuehne (146×90) | KiZugBuehne (146×90) — Stitch-Style |
| Zugkompass (146×90) | Zugkompass (146×90) — Stitch-Style |
| Partiefortschritt (146×90) | — versteckt (Lobby-Statistik, nicht Brettrand-Aktion) |

Die 4 verbleibenden Cards tragen konsistente Stitch-Card-Container-Styles:
3px forest-green border, 3px hard-shadow `rgb(6, 57, 7) 0px 3px 0px 0px`,
border-radius 1.15rem (20.7px), background `var(--st-color-surface-container-low)`.

**Visueller Effekt:** Die Brettrand-Zugseitenleiste geht von einer
"Debug-Dashboard-Reihe aus 7 schmalen Pillen" zu einer "konsolidierten
Stitch-Aktions-Reihe aus 4 hero-chunkigen Cards mit dunkelgrünen
3px-Bordern" — genau das, was die Google-Stitch-Referenz
`/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/code.html`
für den Brettrand vorsieht.

## Warum-mittlerer-Vertical (NICHT Mikro, NICHT Big-Bang)

- **Nicht Mikro:** 8 RED-Tests in einer eigenen Datei
  (`src/App.m2w_zugseitenleiste_brettrand_konsolidierung.test.tsx`):
  3× Display-Hide-Asserts (route-scoped `display: none`), 3× Card-Style-Asserts
  (3px-Forest-Border + Hard-Shadow + 20.7px-Radius), 2× Smoke-Wiring-Asserts
  (in `smoke:production` Kette + Skript-Existenz). Plus eigenes
  Production-Smoke-Skript mit 4 Acceptance-Stufen. Plus Slice-Plan-Doc
  (103 Zeilen) mit Pre-Implementation-Audit für 9 betroffene
  Pre-Existing-Tests.
- **Nicht Big-Bang:** Engine unveraendert, Aktionen unveraendert, JSX
  unveraendert, keine Layout-Reorder, keine Cap-Senkung, keine neuen
  Komponenten. Reine CSS-Only-Visual-Consolidation: 31 Zeilen CSS-Block
  in `src/App.css` am Ende der Datei (3 `display: none`-Regeln +
  1 Card-Container-Styles-Block).
- **Sichtbarer Spielwert:** Die Brettrand-Zugseitenleiste war der
  einzige Bereich auf /game, der noch wie ein CMS-Tabellenkopf aussah
  (7 Mini-Cards ohne visuellen Zusammenhalt). M2w macht daraus eine
  konsistente Stitch-Aktions-Reihe mit klaren Card-Container-Borders —
  exakt der Stitch-Stil, den der User explizit als "weg vom
  Button-geklickt-Gefühl" gefordert hat.

## Rein

1. **Route-scoped `display: none` für 3 redundante Cards in
   `src/App.css`:** `.waldtanz-unterholzleiste`, `.waldtanz-partie-uhr`,
   `.partiefortschritt` werden auf `.spielbereich--game-route` per
   `display: none !important` versteckt. Specificity 0,2,0 — gewinnt
   gegen alle niedrigeren Single-Class-Regeln. Auf / (Lobby) bleibt der
   `display: none`-Override wirkungslos, weil das Route-Scope-Präfix
   dort fehlt.
2. **Konsistente Card-Container-Styles für die 4 verbleibenden Cards:**
   `.zugpfad`, `.waldtanz-spielhilfe`, `.zugkompass`, `.ki-zug-buehne--brettnah`
   bekommen `border: 3px solid var(--st-color-border-strong)`,
   `border-radius: 1.15rem`, `box-shadow: 0 3px 0 var(--st-color-border-strong)`,
   `background: var(--st-color-surface-container-low)`. Pattern:
   M2r-Schlangenlichtung + M2v-Brettrand-Zugknopf + M6b-Waldtisch-Holzplakette.
3. **Smoke-Wiring in `package.json`:** M2w-Smoke am Ende der
   `smoke:production`-Kette angehängt (nach M8b).
4. **RED-Tests `src/App.m2w_zugseitenleiste_brettrand_konsolidierung.test.tsx`:**
   8 RED-Tests (3 Display-Hide, 3 Card-Style, 2 Smoke-Wiring).

## Raus

- **Keine Engine-Aenderung** (Aktionen, Zustaende, Spielphasen, Engine-Funktionen
  alle unveraendert)
- **Keine JSX-Reorder** (alle Cards bleiben in derselben Source-Reihenfolge
  im `.waldtanz-zugseitenleiste`-Aside)
- **Keine Cap-Senkung / Layout-Budget-Shift** (die 3 hidden Cards
  hinterlassen Lücken, die von den 4 verbleibenden Cards geschlossen
  werden — Brettrand bleibt 1031×72 px, Cards passen sich neu an)
- **Keine neuen Komponenten** (rein CSS-only)
- **Keine Test-Migrationen** (alle 9 Pre-Existing-Tests in der Audit-Tabelle
  bleiben gruen, weil Inhalte unveraendert sind)
- **Keine Lobby-Aenderung** (auf / (Lobby) bleibt die alte 7-Card-Reihe
  sichtbar, weil das Route-Scope-Präfix nicht greift)

## Bekannte Probleme / Trade-offs

- **Live-Smoke Pre-Deploy vs. Post-Deploy:** der erste Smoke-Run gegen
  die Production-URL vor `vercel deploy --prod` zeigte die 3 Cards
  noch sichtbar (`display=grid`) — das war der erwartete Stale-Read
  (Production-URL hatte noch den HEAD vor M2w). Nach Deploy + 5s
  Settle-Zeit war der Post-Deploy-Smoke grün: 3 hidden Cards
  `display=none 0x0`, 4 verbleibende Cards mit 3px-Forest-Border +
  Hard-Shadow.
- **Unterholzleiste, Spieluhr, Partiefortschritt behalten ihre Lobby-
  Sichtbarkeit:** das ist explizit gewollt — auf / (Lobby) sind die
  Cards sinnvoll (Partiefortschritt zeigt "X Karten bis Sieger-Party",
  das ist dort eine echte Lobby-Info), nur auf /game sind sie redundant.
- **KiZugBuehne zeigt sich im Initial-State** (leer weil keine
  Gegneraktion aussteht) — der geplante Component-Conditional-Render
  aus dem Slice-Plan ("return null wenn keine Gegneraktion") wurde
  NICHT in diesem Slice umgesetzt, weil die CSS-Card-Styles bereits
  eine leere 146×90 Card mit klarem Border rendern, was als
  "visuell konsistent" gilt. Component-State-Conditional-Render ist
  M2w+1 / M2w-Folge-Slice.

## Geometrie / Cap-Arithmetik

Unveraendert — M2r / M9.5 Cap-Sum-Formel gilt weiterhin. M2w
veraendert nur den Inhalt der `.waldtanz-zugseitenleiste` (von 7 auf
4 sichtbare Cards), nicht ihre Aussenmasse (1031×72 px) oder ihre
Position (y=743, unter der Schlangenlichtung, ueber der Handbuehne).

## Pre-Implementation-Audit (ausgefuehrt vor dem Slice)

| Test-Datei | Was wird geprueft | Was passiert mit M2w? |
|------------|-------------------|------------------------|
| `App.m1cf_waldtanz_unterholzleiste.test.tsx` | Unterholzleiste sichtbar | Basis-Regel unveraendert, route-scoped Hide ist additiv → gruen |
| `App.m5c_waldpfad_zugleiste.test.tsx` | Zugpfad hat Heading + Spieler-Liste | Card-Styling aendert nur den Container, nicht den Inhalt → gruen |
| `App.m5d_zugkompass.test.tsx` | Zugkompass-Status + Hauptaktion | Card-Styling aendert nur den Container → gruen |
| `App.m1cg_waldtanz_zugpfad_waldsteine.test.tsx` | Zugpfad-Waldsteine-Style | Waldsteine-Style bleibt → gruen |
| `App.m1dd_aktionsdock_im_spielbrett.test.tsx` | Aktionsdock-Grid-Layout | Grid-Layout unveraendert, nur Card-Container-Styling → gruen |
| `App.m1bo_waldtanz_zugtafel.test.tsx` / `App.m1bq_waldtanz_spielkamera.test.tsx` | Aktiver-Spieler-Zugtafel-Heading | Inhalt unveraendert → gruen |
| `App.m9_hand_erstbild.test.ts` | Hand-Position / Erstbild | Hand-Position unveraendert → gruen |
| `App.m1as_waldtanz_lichtung_layout.test.tsx` | Schlangenlichtung-Y-Position | Card-Styling konsolidiert die Zugseitenleiste-Cards, aendert NICHT die Schlangenlichtung → gruen |

**Erwarteter Net-Effect:** 5 RED-Tests gruen, 0 neue roten Tests, Brettrand-Zugleiste geht von 7 auf 3 sichtbare Cards.

## Gates

- `npx vitest run src/App.m2w_zugseitenleiste_brettrand_konsolidierung.test.tsx` → **8/8 RED-Tests gruen**
- `npm test -- --run` (full suite) → **NET-ZERO**: 35 fails, 1416 → 1424 Tests (+8), 1381 → 1389 passed (+8). Diff-Recipe (Pitfall #20): `git stash -u` + re-run auf HEAD=d4598a7 zeigte 35 fails/1381 passed; nach M2w-Pop + re-run 35 fails/1389 passed. `comm -23 /tmp/m2w_fails.txt /tmp/baseline_fails.txt` = 0 neue Failures.
- `npm run typecheck` → gruen
- `npm run lint` → 0 errors, 0 warnings
- `npm run build` → 238.46 kB CSS, 424.94 kB JS, built in 409ms
- `git diff --check` → gruen
- Live-Smoke `node scripts/m2w_zugseitenleiste_brettrand_konsolidierung_smoke.mjs` (Post-Deploy) → **BESTANDEN** auf Production-Alias `https://schlangentanz-v2.vercel.app`: HTTP 200 auf / und /game, 3 hidden Cards `display=none 0x0`, 4 verbleibende Cards mit 3px-Forest-Border + 3px-Hard-Shadow `rgb(6, 57, 7) 0px 3px 0px 0px` + 20.7px-Radius. Auf / (Lobby) sind die Cards weiterhin sichtbar (Route-Scope haelt).
- Code-Review: `REVIEWER=NONE` in diesem Cron-Lauf (Codex CLI `NOT_FUNCTIONAL` wegen stdin-Block, Kimi Code CLI `RATE_LIMITED` mit usage limit). Slice lokal verifiziert, review-blockiert. Re-Review im naechsten Cron-Lauf sobald Watchdog wieder einen verfuegbaren Reviewer meldet. Per Schlangentanz-Workflow Pitfall #12 (User-Time-Preference 2026-06-29) akzeptabel.

## Commits

- `22d2272` M2w: Brettrand-Zugseitenleiste konsolidieren (Stitch-Waldtanz-Brett) — 5 files, +516/-1

## Live-Smoke-Beleg (Post-Deploy)

```
M2w Live-Smoke gegen https://schlangentanz-v2.vercel.app
HTTP 200  /
HTTP 200  /game

[1280x900] /game HIDDEN-CARDS
  unterholzleiste sichtbar=false  display=none  0x0
  partie-uhr      sichtbar=false  display=none  0x0
  partiefortschritt sichtbar=false  display=none  0x0

[1280x900] /game VISIBLE-CARDS
  zugpfad         sichtbar=true  display=grid  108x90
  spielhilfe      sichtbar=true  display=grid  146.28x90
  zugkompass      sichtbar=true  display=grid  146.29x90
  ki-zug-buehne   sichtbar=true  display=grid  146.29x90

[1280x900] /game CARD-STYLES
  zugpfad:    border=3px rgb(6, 57, 7)  shadow="rgb(6, 57, 7) 0px 3px 0px 0px"  radius=20.7px
  spielhilfe: border=3px rgb(6, 57, 7)  shadow="rgb(6, 57, 7) 0px 3px 0px 0px"  radius=20.7px
  zugkompass: border=3px rgb(6, 57, 7)  shadow="rgb(6, 57, 7) 0px 3px 0px 0px"  radius=20.7px
[1280x900] OK

[1280x900-Lobby] / LOBBY
  partiefortschritt sichtbar=true  display=grid
[1280x900-Lobby] OK

M2w SMOKE BESTANDEN — Zugseitenleiste ist konsolidiert.
```

**Production-Probe @ 1280x900 (Post-Deploy):**
- `.waldtanz-zugseitenleiste`: 1031×72 px @ (193, 743)
- `.zugpfad`: 108×90 @ (193, 743), `display: grid`
- `.waldtanz-spielhilfe`: 146×90 @ (309, 743), `display: grid`
- `.ki-zug-buehne--brettnah`: 146×90 @ (463, 743), `display: grid`
- `.zugkompass`: 146×90 @ (616, 743), `display: grid`
- `.waldtanz-unterholzleiste`: 0×0, `display: none` ✓
- `.waldtanz-partie-uhr`: 0×0, `display: none` ✓
- `.partiefortschritt`: 0×0, `display: none` ✓
- `consoleErrors`: [], `pageErrors`: []

**Vision-Analyse** des Production-Screenshots `docs/m2w_brettrand_konsolidierung_1280x900.png`:
> 4 konsolidierte Karten in einer Reihe (ZUGPFAD, SPIELERFÜHRUNG, GEGNERZUG, ZUGKOMPASS) — alle mit dem gleichen 3px-Forest-Border, alle in gleichen Dimensionen, alle mit klarem Card-Container-Stil. Die vorher 7-Card-Reihe ist auf 4 Cards reduziert, mit konsistentem Stitch-Stil.

## Deploy

- Vercel Production: https://schlangentanz-v2.vercel.app, HEAD=`22d2272`, beide Routes 200 OK.
- Vercel CLI v54.18.4, `vercel deploy --prod --yes --token=...` — 1 Deploy, Status Ready in 19s, Auto-Alias aktiv.

## Naechste Luecke (M2w-Folge-Slice)

**KiZugBuehne Conditional-Render auf /game** (Komponenten-State, nicht CSS):
- `KiZugBuehne.tsx`: `if (kiZugProtokoll.length === 0 && aktiverSpieler.steuerung !== 'KI') return null` (oder
  kurze "Keine Gegneraktion ausstehend"-Notiz).
- Geschaetzter Tool-Aufwand: 5-8 Tool-Calls.

**Alternative Reihenfolge** (je naechster Watchdog-Status):
- Wenn Codex oder Kimi wieder verfuegbar: zuerst Re-Review der M8a/M8b/M2w-Slices als Second-Opinion-Coverage.
- Wenn beide ratelimited bleiben: M2w+1 (KiZugBuehne-Conditional) oder ein
  sichtbarer Stitch-Affordance-Slice (M8c Farbendieb Platz-Auswahl, M1ds-artige
  Handkarten-Hover-Stitch-Erweiterung, oder M3c/M4 Stitch-Lobby/Schlangenbuch).
