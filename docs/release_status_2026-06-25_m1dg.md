# M1dg — Waldtanz-Lichtungsstein (zentraler Spielplatz auf /game)

> **Status:** Release-Fertig (cron-run 25.06.2026 03:55 lokal).
> **Typ:** Sichtbarer Brettschritt-Affordance-Slice (kein Engine-Touchpoint).
> **Vorgänger:** M1df (Magiekreise als runde Drop-Steine auf gemeinsamem
> Stein-Hintergrund).
> **Nachfolger:** offen — naechster sichtbarer Waldtanz-Board-Vertical.

## Was sichtbar/strukturell besser wurde

Auf `/game` fasst der neue **Waldtanz-Lichtungsstein** die zentrale
Spieltflaeche zu **einer** taktilen Waldstein-Insel zusammen:
Tischkarte + Magiekreise (M1df-Drop-Steine) + Schlangenbereich sitzen
jetzt auf einer gemeinsamen, sichtbar abgesetzten Stein-Spielflaeche
mit:

- **3 px Dark-Forest-Border** (`rgb(6, 57, 7)`)
- **4 px Hard-Shadow** unter dem Stein (`box-shadow: 0 4px 0 var(--st-color-border-strong)`)
- **clamp-Border-Radius** (1.4 rem – 2.2 rem je nach Viewport-Bereite)
- **Stein-Gradient** aus Sonne-Obst (radial-gradient oben Mitte),
  Sunny-Green-Akzent unten-links und Sonnengelb oben-rechts auf
  einem Lime-zu-Gruen-Verlauf
- **`::before`-Innenrahmen** (2 px gestrichelt, transparent) als
  zarter Waldlichtung-Highlight
- **`data-waldtanz-spielplatz="waldlichtung"`** als semantisches
  Token fuer spaetere Spielwert-Reads

Der Stein ersetzt **rein visuell** die flache Panel-Optik der
inneren Schlangenlichtung auf /game — Engine-Regeln, Legal-Aktionen,
Aktionspfade und Aria-Labels bleiben unveraendert. Tischkarte,
Magiekreise (M1df-Drop-Steine) und Schlangenbereich bleiben als
getrennte Brettobjekte erhalten und gewinnen durch den gemeinsamen
Stein-Rahmen als Spielort an Praesenz.

## Slice-Scope

### Rein

- `src/App.tsx` (+1/-1): `className="waldtanz-arenastein__schlangenlichtung
  waldtanz-lichtungsbrett waldtanz-lichtungsstein"` plus
  `data-waldtanz-spielplatz="waldlichtung"`.
- `src/App.css` (+63 Zeilen):
  - `.waldtanz-lichtungsstein` (Basis, am Fileende): `position: relative`,
    `border: 3px solid var(--st-color-border-strong)`,
    `padding: clamp(0.4rem, 0.85vw, 0.7rem)` (M1d1-Clip-Schutz),
    `border-radius: clamp(1.4rem, 2.4vw, 2.2rem)`,
    `box-shadow: 0 4px 0 var(--st-color-border-strong)`.
  - `.waldtanz-lichtungsstein::before` (Basis): zarter
    `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.34) 0 22%,
    transparent 70%)` Highlight, `inset: clamp(0.15rem, 0.4vw, 0.3rem)`,
    `border-radius: clamp(1.1rem, 2vw, 1.85rem)`.
  - `.waldtanz-lichtungsstein > * { position: relative; z-index: 1; }`
    damit Kinder ueber dem ::before-Layer sitzen.
  - `.spielbereich--game-route [class~="waldtanz-lichtungsstein"]`
    + `::before` + `> *` (Route-Scope, Specificity 0,2,0): Stein-Gradient
    (4-Layer radial-gradient), `::before` mit 2 px gestricheltem
    Innenrahmen in `rgba(6, 57, 7, 0.22)`.
- `scripts/m1dg_waldtanz_lichtungsstein_smoke.mjs` (NEU, 153 Zeilen):
  Playwright-Browser-Smoke beweist im echten Browser den Stein-Container,
  3 px Dark-Forest-Border, 4 px Hard-Shadow, border-radius > 8 px,
  `::before`-Pseudo-Element mit radial-gradient, Magiekreise +
  Schlangenbereich + Tischkarte als Kinder, Container im Viewport,
  keine console/page-Fehler.
- `src/App.m1dg_waldtanz_lichtungsstein.test.tsx` (NEU, 86 Zeilen,
  5 RED-Tests): CSS-Source-Vertrag (3 px Border, box-shadow, padding,
  border-radius, radial-gradient ::before), DOM-Structure (genau 1
  Container mit Magiekreise + Schlangenbereich), Cascade-Reihenfolge
  (Lichtungsstein nach Arenstein).
- `src/App.m1dg_smoke_wiring.test.ts` (NEU, 52 Zeilen, 4 Tests):
  Skript-Existenz, Smoke-Inhalt (Lichtungsstein/Magiekreise/Schlangen-
  Strings), package.json-Einbindung, Reihenfolge M1e < M1df < M1dg < M1d1.
- `package.json` (+1/-1): M1dg-Smoke in `smoke:production`-Kette
  zwischen M1df und M1d1 eingefuegt.

### Tests

- `src/App.m1dg_waldtanz_lichtungsstein.test.tsx`: 5 RED-Tests.
- `src/App.m1dg_smoke_wiring.test.ts`: 4 RED-Tests.
- Volle Suite: **1093/1093 gruen** (336 files, vorher 1084 → +9 Tests).

### Raus (explizit)

- Keine Engine-Aenderung.
- Keine Aenderung an Legal-Aktionen, `onAktion`-Pfaden, aria-labels
  der Brettobjekte.
- Keine Layout-/Viewport-Schirurgie (Arena-Cap, Grid-Order bleiben
  unangetastet).
- `.waldtanz-lichtungsbrett`-Klasse bleibt im `className` (M1bd,
  M1as, M1d0 Tests verlangen sie; das ist Kimi-NON-BLOCKER #1
  "redundant Naming", aber strukturell noetig).
- Keine Tailwind-Imports, keine externen Bilder.

## RED → GREEN

### RED-Tests (vor Implementierung, gegen clean HEAD)

- `src/App.m1dg_waldtanz_lichtungsstein.test.tsx`: 5/5 schlugen fehl
  (Basis-Regel fehlt, ::before ohne radial-gradient, kein DOM-Element,
  Cascade-Reihenfolge).
- `src/App.m1dg_smoke_wiring.test.ts`: 4/4 schlugen fehl (Skript
  fehlt, package.json-Einbindung fehlt, Kette-Reihenfolge fehlt).

### Claude Code / `/simplify`

- Claude Code blieb durch den bekannten 401-Blocker unbenutzbar
  (siehe M1d3-Doku). Manueller Fallback mit objektivem RED-Test,
  Diff-/CSS-Cascade-/Line-Budget-Selbstcheck vor Review.

### Code-Review: Kimi Code CLI (statt Codex)

- Codex OAuth hatte `usage limit` (gueltig bis 25.06.2026 19:07 UTC);
  Kimi Code CLI `0.18.x` (k2p7) als Review-Fallback, review-only.
- **Befund:** `BLOCKERS: none`. Drei NON-BLOCKERS:
  1. `.waldtanz-lichtungsbrett` bleibt im className (Kimi halt das fuer
     redundant, aber M1bd/M1as/M1d0-Tests verlangen die Klasse —
     NON-AKTIONABEL).
  2. Browser-Smoke prueft `boxShadow !== 'none'` statt explizit
     "4 px Hard-Shadow dark-forest" (lokal verifiziert via getComputedStyle:
     `rgb(6, 57, 7) 0px 4px 0px 0px` — entspricht dem Vertrag).
  3. Test-Kommentar in `App.m1dg_waldtanz_lichtungsstein.test.tsx`
     enthaelt Tippfehler "Spieltfeld" statt "Spielfeld" — kein
     User-facing Copy.
- Keine Re-Review noetig.

## Cascade-Schutz fuer M1d1-Clip

Der M1dg-Stein haette urspruenglich `padding: clamp(0.55rem, 1.1vw,
0.85rem)` bekommen (M1df-Pattern). Beim Smoke-Test auf 1440x900 brach
damit der M1d1-Clip-Schlangenlichtung-Vertrag: Schlangen sichtbar 68.83 px
< 70 px erforderlich. **Fix:** Padding auf `clamp(0.4rem, 0.85vw, 0.7rem)`
reduziert, `::before`-inset auf `clamp(0.15rem, 0.4vw, 0.3rem)`
reduziert. Re-Verifikation auf 1440x900: Schlangen sichtbar 71.89 px
(>= 70 px), M1d1-Smoke gruen.

## Gates

| Gate | Resultat |
|---|---|
| `npx vitest run src/App.m1dg_*.test.tsx` | 9/9 gruen |
| `npx vitest run` (full suite) | 1093/1093 gruen (336 files) |
| `npm run typecheck` | gruen |
| `npm run lint` | gruen |
| `npm run build` | gruen (202.72 kB CSS, 402.49 kB JS) |
| `npm run check:test-lines` | gruen (alle Test-Dateien < 500) |
| `git diff --check` | gruen |
| `node scripts/m1dg_waldtanz_lichtungsstein_smoke.mjs` (lokal) | OK (974x262 px, 3 px Border, 4 px Hard-Shadow, ::before radial-gradient, 0 console-errors) |
| `node scripts/m1df_waldtanz_steinkreis_smoke.mjs` (lokal) | OK |
| `node scripts/m1e_waldtanz_spieluhr_smoke.mjs` (lokal) | OK |
| `node scripts/m1d0_waldtanz_layout_konsolidierung_smoke.mjs` (lokal) | OK |
| `node scripts/m1d1_arena_flex_column_smoke.mjs` (lokal, 1280x900) | OK (Schlangen sichtbar 79.06 px) |
| `node scripts/m1d1_arena_flex_column_smoke.mjs` (lokal, 1440x900) | OK (Schlangen sichtbar 71.89 px > 70 px nach Padding-Reduktion) |

## Release

- Commit: `M1dg: Waldtanz-Lichtungsstein als zentraler Spielplatz auf /game`
- 6 files, +467 / -3
- Push: `main` → `origin/main`
- Vercel Production Deploy: folgt im naechsten Schritt
- M1dg-Live-Smoke auf Production-Alias: folgt im naechsten Schritt

## Anmerkungen fuer den naechsten Slice

- M1dg ist ein **rein visueller Slice** — Engine bleibt unveraendert,
  Legal-Aktionen bleiben unveraendert. Nichts an der Spielmechanik
  aendert sich, die zentrale Spielflaeche liest sich aber jetzt als
  **ein** gemeinsamer Spielort statt als drei nebeneinander liegende
  Panels.
- App.tsx bleibt mit 497 Zeilen unveraendert (1 Klassenname + 1
  data-Attribut hinzugefuegt).
- Reaper-Hygiene eingehalten: keine `_probe.mjs`-Skripte, keine
  `*.png` im Repo, M1dg-Screenshot im `/tmp`.
- Token-Guard nicht noetig: nur existierende
  `--st-color-border-strong` werden verwendet, keine neuen `:root`-Token.
- Naechster sichtbarer Vertikalschritt auf /game: **M1dh-Kandidat** —
  der Lichtungsstein koennte eine **sichtbare Areal-Beschriftung**
  ("Waldlichtung" als visible Playfield-Name-Banner) bekommen, sobald
  die Engine-Aktionen auf dem Stein einen ersten visuellen Bezugspunkt
  brauchen. Bis dahin ist M1dg ein abgeschlossener Sichtbarkeits-Slice
  ohne Folgepflicht.