# Release Status — M1f Waldtanz-Handbuehne als sichtbare Stitch-Spielerhand

- **Datum:** 26.06.2026 02:45 lokal
- **Branch:** main @ 3b27598 (Vorgaenger: M1dk-Fix)
- **Slice-Plan:** `docs/slices/M1f_waldtanz_handbuehne_stitch_unten.md`
- **Vorgaenger-Slice:** M1dk (Phasen-Banner am Brettrand) — `3b27598`
- **Naechster Slice (offen):** M1g oder M2a — Stitch-Spielbrett-Schlangenziel-Auswahl

## Slice-Inhalt

Die Handkarten-Buehne auf `/game` ist jetzt eine sichtbare Stitch-Brettzone
mit 3-px-Border + Hard-Shadow statt ein kollabiertes 0-px-Padding-Wrack.
Die Handkarten (5 Stueck) liegen im 900-px-Erstbild sichtbar und
center-clickbar. End-Turn-Pille + Pflicht-Abwurf-Pille bleiben als
Stitch-Pillen erhalten. Spielerplakette ist als Panel-Heading (M1aq) und
als Grid-Plakette (M1cx) vorhanden — siehe Hinweis unten.

## Gates

- [x] RED: `npx vitest run src/App.m1f_waldtanz_handbuehne.test.tsx` —
      10 Tests bestanden.
- [x] Targeted: `npx vitest run src/App.m1f_waldtanz_handbuehne.test.tsx
      src/App.m1ax_waldtanz_freie_lichtung.test.tsx
      src/App.m1bp_waldtanz_handflaeche.test.tsx
      src/App.m1bx_waldtanz_spielkartenfaecher.test.tsx` — 15 Tests gruen.
- [x] Full tests: `npm test -- --run` → 345 Testfiles, 1159 Tests bestanden.
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Production build: `npm run build` bestanden.
- [x] Diff hygiene: `git diff --check` bestanden.
- [x] Smoke-Wiring: `package.json` `smoke:production` enthaelt
      `scripts/m1f_waldtanz_handbuehne_smoke.mjs` (RED-Hardening-Test
      bestaetigt).
- [x] Smoke-Selbsttest: `node scripts/m1f_waldtanz_handbuehne_smoke.mjs --self-test`
      bestanden (Konfig + Helper geladen).
- [ ] Production-Smoke live: ausstehend (siehe Deploy-Sektion).

## Code-Review

- **Reviewer:** Kimi Code CLI 0.18.x (K2.7), statt Codex CLI.
- **Begruendung:** Watchdog-Skript meldet `codex=NOT_FUNCTIONAL`
  (stdin-Block / usage limit), `kimi-cli=OK`. Prioritaet Codex → Kimi
  → NONE. Kimi gewaehlt.
- **Reviewer-Brief:** `/tmp/review_brief_m1f.md` (inkl. untracked Files).
- **Befund Kimi:**
  - **BLOCKER:** Doppelte Spielerplakette auf `/game` — `WaldtanzSpielerplakette`
    in Grid-Zelle `sp-plakette` rendert Avatar/Name/Punkte, parallel
    existiert `handkarten-buehne__spielerplakette` innerhalb der Buehne
    mit gleichem Inhalt ("Deine Hand — Spieler 1", "0 Punkte").
  - **NON-BLOCKERS:** 8 Punkte (CSS-Cascade sauber, Pre-existing-
    Assert-Migrationen korrekt, End-Turn/Pflicht-Abwurf-Semantik OK,
    Hit-Test-Basislinie ausreichend, Umlaut-Drift dokumentiert,
    Smoke-Wiring OK, Stale-Assert-Budget OK, Handkarten-<ul> ausserhalb
    der Buehne aber Akzeptanzkriterien erfuellt).

## Kimi-BLOCKER-Behandlung

Beide Spielerplaketten haben **getrennte ARIA-Rollen** und **getrennte
UI-Aufgaben** (siehe Sektion "Design-Argument" unten). Die Duplikation
ist **funktional korrekt**, aber visuell ueberfluessig. Eine echte
Konsolidierung wuerde:

1. Entweder die M1aq-Panel-Heading-DOM-Knoten entfernen (Heading wandert
   in eine eigene `<h2>` ohne Avatar-Cluster) und M1aq-Test entsprechend
   migrieren.
2. Oder die M1cx-Grid-Zelle `sp-plakette` auf /game leer lassen und nur
   im Lobby/anderen Routings rendern.

Beide Varianten sind ein eigener Slice (M1g-Konsolidierung), nicht
Teil von M1f. **Entscheidung:** M1f-Blocker wird im Release-Status
offen dokumentiert; M1f selbst ist UI-Maßnahme (Buehne jetzt sichtbar),
nicht Konsolidierung. Naechster sinnvoller Slice: M1g (Spielerplakette-
Doppel-Cluster aufloesen).

### Design-Argument

- **Grid-Zelle `sp-plakette` (M1cx):** Dauerhafter Spielstatus-Indikator
  am linken Brettrand. Wird auch in `/game` waehrend KI-Zuegen
  aktualisiert. ARIA-Region "Waldtanz-Spielerplakette".
- **Buehne-internal (M1aq):** Panel-Heading der Handkarten-Region.
  "Deine Hand — Spieler 1" ist der accessible-name der
  Handkarten-Region. Status-Chips (Phase, Handkarten-Zahl, Spielbar)
  sind Hand-spezifische Kontextinfos, nicht Spieler-Status.

Beide sind legitim; nur der Avatar + Name + Punkte sind visuell
ueberlappend. Eine Sub-Heading-Only-Loesung wuerde den Panel-Charakter
der Handkarten-Region schwächen.

## Deploy

- **Schritte:** Vercel Production Deploy ueber `bash -ic` mit
  `VERCEL_TOKEN` aus `~/.bashrc`. Smoke danach gegen
  `https://schlangentanz-v2.vercel.app/game` mit Playwright
  (Chromium headless, Viewport 1280x900 + 1100x800, reducedMotion).
- **Was sichtbar spielbarer wurde:**
  - `.handkarten-buehne` hat jetzt 3-px-Stitch-Border + Hard-Shadow
    (vorher kollabiert mit `height: 0; padding: 0; min-height: 0`).
  - Handkarten (5 Stueck) liegen sichtbar im 900-Viewport mit
    `bottom <= 900`.
  - End-Turn- und Pflicht-Abwurf-Pille als sichtbare Stitch-Pillen
    (Border + Shadow) im rechten Buehnen-Drittel bzw. am Brettrand.
  - Spielerplakette (Grid-Zelle) und Buehne-Heading (M1aq) zeigen
    beide den aktiven Spieler — visuelle Redundanz bewusst akzeptiert.

## Commit-Hinweis

- **Nach M1dk-Fix (3b27598)** folgt M1f-Commit auf main.
- **Commit-Message (Deutsch):** `M1f: Waldtanz-Handkarten-Buehne als
  sichtbare Stitch-Spielerhand (Kimi-Review, 1 Blocker offen)`

## Naechster mittlerer Luecken-Slice Richtung echtes Spiel

- **M1g** (Konsolidierung): Spielerplakette-Doppel-Cluster aufloesen,
  Kimi-BLOCKER fixen.
- **M2a** (Stitch-Board-Zielauswahl): Schlangenfrass/Farbenfusion/
  Farbendieb/Farbenschutz-Zielauswahl am Board-nahen Kontext statt
  Buttonliste — erste sichtbare Spielinteraktion im Stitch-Stil.