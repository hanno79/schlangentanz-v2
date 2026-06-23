# M4c — Waldtanz-Sieger-Party als freudige Stitch-Feier

> **Status:** Release complete (cron-run 23.06.2026).
> **Typ:** Mittlerer Vertical (UI/UX, emotionaler Siegesmoment), kein Engine-Touchpoint.
> **Vorgänger:** M4b (Sieger-Party Results) + M1dd (Aktionsdock im Spielbrett).
> **Nachfolger:** offen.

## Was sichtbar spielbarer wurde

Der Siegesmoment — der spielerische Höhepunkt — war bisher eine flache Sektion
mit nur 3 Konfetti-Stücken und nackten Emoji-Porträts. Mit M4c wird die
Sieger-Party zu einer echten **Stitch-Feier**:

- **Konfetti-Regen:** 10 bunte Stücke (4 Farbvarianten: Gold, Limette,
  Korallenrot, Waldgrün) statt bisher 3, über die ganze Parteifläche verteilt.
- **Schwebende Luftballons:** 6 Ballons mit party-balloon-Animation (sanftes
  Auf-und-Ab + Neigung), mit Knoten-Pseudo-Element, in 3 Farben.
- **Glühende Korona:** Ein pulsierender radialer Glühhof (party-pulse) hinter
  der Gewinnerfigur — vermittelt den "es strahlt"-Moment.
- **Pokal-Badge:** Ein wackelnder Pokal (party-wiggle) neben der Schlange —
  der spielerische "Du hast gewonnen!"-Stolz.
- **Reduced-Motion:** Alle Feier-Animationen (Konfetti, Ballons, Portrait,
  Korona, Pokal) stoppen sauber bei `prefers-reduced-motion: reduce`.

## Slice-Scope

### Rein
- SiegerParty-Komponente: 10 Konfetti-Spans (Klassen statt nackte spans),
  6 Ballon-Spans, Korona-Span, Pokal-Span hinzugefügt.
- App.css: Konfetti-System auf klassenbasierte Selektoren umgestellt,
  Ballon-Styles + ::after-Knoten, Korona-Gradient + Blur, Pokal-Positionierung,
  3 neue @keyframes (party-balloon, party-wiggle, party-pulse),
  prefers-reduced-motion-Media-Query für alle Feier-Animationen.

### Raus (explizit)
- Keine Engine-Änderung.
- Keine Datenvertrags-Änderung (Gesamtpunkte, Farbgruppen, Aufgaben, Gewinner,
  Neustart bleiben identisch).
- Keine DOM-Strukturbrechung (Sieger-Party bleibt region im Spielbereich).
- Keine Mobile/Tablet-Refactor.

## RED → GREEN

### RED-Tests
- `src/App.m4c_sieger_party_feier.test.tsx` (8 Tests):
  - Konfetti-Regen ≥ 8 Stücke
  - Luftballons ≥ 4 Stücke
  - Glühende Korona vorhanden
  - Pokal-Badge vorhanden
  - M4b-Datenverträge bewahrt
  - CSS-Animationen verankert (party-balloon, party-wiggle, Korona, Ballons, Pokal)
  - prefers-reduced-motion respektiert
  - Neustart aus angereicherter Party funktioniert

### Claude Code / `/simplify`
- `claude --model opusplan` blieb durch `401 Invalid authentication credentials`
  blockiert. Kimi Code CLI durch `429 rate_limit` blockiert.
- Der Slice wurde als enger manueller Fallback umgesetzt mit objektivem RED-Test,
  Diff-/CSS-Cascade-/Line-Budget-Selbstcheck und lokalem Browser-Health-Smoke.

### Code-Review
- Weder Codex CLI (usage limit bis 25.06.2026 19:07 UTC) noch Kimi Code CLI
  (429 rate_limit) noch Claude Code (401 auth) waren verfügbar.
- Manuelle Selbstprüfung: Diff-Stat (110 insertions, 7 deletions, 2 modified +
  1 new file), CSS-Cascade (alle neuen Regeln nach bestehenden, keine
  Überschreibungs-Konflikte), Line-Budget (App.tsx 494 ≤ 500, SiegerParty 94
  ≤ 500), keine untracked Probe-Skripte im Commit.

## Gates (alle grün)

- [x] **Full Suite:** `npm test -- --run` → 327 Test Files, **1046 Tests passed**
- [x] **Test-Lines:** `npm run check:test-lines` → alle unter 500
- [x] **Typecheck:** `npm run typecheck` passed
- [x] **Lint:** `npm run lint` passed
- [x] **Build:** `npm run build` → 194.14 kB CSS, 398.35 kB JS
- [x] **Diff-Hygiene:** `git diff --check` clean
- [x] **Line-Budget:** `App.tsx` = 494 Zeilen, `SiegerParty.tsx` = 94 Zeilen

## Deploy / Smoke

- [x] **Commit:** `e1afdeb — M4c: Waldtanz-Sieger-Party als freudige Stitch-Feier`
- [x] **Push:** `origin/main` aktualisiert
- [x] **Vercel Production Deploy:** `READY` in 18s, aliased to
  `https://schlangentanz-v2.vercel.app`
- [x] **Live Smoke:**
  - `/` HTTP 200, Lobby lädt ("Bereit im sonnigen Nest")
  - `/game` HTTP 200, Spielstatus + Arenastein + Handkarten sichtbar
  - Console/Page Errors: keine

## Bekannte Pre-Existing-Schulden (nicht durch M4c verursacht)

- **M1as Layout-Smoke:** Schlangenbereich-Sichtbarkeit bei 99px (Threshold
  130px). Pre-existing seit M1d0/M1dd Arenastein-Cap-Trade-off. Betrifft nur
  das normale `/game`-Erstbild, nicht die Sieger-Party. Sollte in einem
  Folge-Slice (M1de Bottom-Row-Viewport-Fit) behoben werden.

## Commits

- `e1afdeb` M4c: Waldtanz-Sieger-Party als freudige Stitch-Feier

## Nächster mittlerer Slice

1. **M1de — Bottom-Row-Viewport-Fit:** Handkarten + Arenazugknopf in den
   900px-Viewport holen und Schlangenbereich-Sichtbarkeit ≥130px wiederherstellen.
2. **M3a — Sonniges-Nest-Lobby als Stitch-Spielerlebnis:** Die Lobby mit
   schwingendem Holzzeichen, animierten Spieler-Slots und bouncigem
   Start-Button zum Stitch-Niveau anheben.
3. **M5 — E2E-Playability:** Vollständige Partie von Lobby bis Sieger-Party
   gegen die Spec verifizieren.
