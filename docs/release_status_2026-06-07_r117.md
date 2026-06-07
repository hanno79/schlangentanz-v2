# R117 Release-Nachweis — Spielerorientierter Hero

Status: lokal verifiziert, Review abgeschlossen; Release/Production-Smoke ausstehend.
Datum: 2026-06-07

## Ziel

R117 ersetzt die bisherige interne Projekt- und Toolchain-Copy im Hero durch eine spielerorientierte Begrüßung:

- H1 ist `Schlangentanz` statt `Schlangentanz v2 Greenfield Rebuild`.
- Hero-Copy spricht Spielende an, nicht Repository-/Toolchain-Kontext.
- Sichtbare Spielziele sind im Hero: farbige Schlangen bauen, Aufgaben erfüllen, Sonderkarten nutzen.
- Interne Begriffe wie `Greenfield`, `GitHub`, `Vercel`, `Claude`, `Codex` und `Freigabe` sind im Hero nicht mehr sichtbar.
- Bestehende Spielbereiche, Engine-Debuganzeigen und UI-Regionen bleiben erhalten.
- Keine Engine-, Regel-, CSS- oder Interaktionsänderung.

## Umgesetzt

- `src/App.tsx`
  - Hero-Eyebrow von internem Projekttext auf `Das Kartenspiel` geändert.
  - H1 auf `Schlangentanz` gekürzt.
  - Hero-Teaser auf `Bereit für deine nächste Schlange` geändert.
  - Hero-Liste auf drei spielerorientierte Ziele reduziert:
    - `Baue farbige Schlangen`
    - `Erfülle Aufgaben`
    - `Nutze Sonderkarten`
- `src/App.r117_player_hero.test.tsx`
  - neuer R117-Regressionstest.
  - scoped den Textcheck auf die Hero-Section über die H1.
  - prüft positive Hero-Copy.
  - prüft, dass interne Projekt-/Toolchain-Wörter im Hero nicht sichtbar sind.
- `src/App.test.tsx`
  - alten Placeholder-/Greenfield-Test auf spielbaren Kartenspiel-Hero umgestellt.
  - Header gemäß Projektregel ergänzt.
- `src/App.f1_design_tokens.test.tsx`
  - veraltete Greenfield-H1-Assertion entfernt.
  - Token- und Regionen-Assertions unverändert erhalten.
- `src/App.f2_app_shell_tokens.test.tsx`
  - veraltete Greenfield-H1-Assertion entfernt.
  - Token- und Regionen-Assertions unverändert erhalten.

## RED/GREEN

- RED:
  - neuer Test `src/App.r117_player_hero.test.tsx` geschrieben.
  - `npm test -- --run src/App.r117_player_hero.test.tsx`
  - Erwarteter Fehlschlag: H1 war noch `Schlangentanz v2 Greenfield Rebuild`, R117 erwartet exakt `Schlangentanz`.
- GREEN:
  - Claude Code `opusplan` hat den Hero minimal auf spielerorientierte Copy umgestellt.
  - Fokustest danach grün.
  - Angrenzende alte Tests wurden nach Vollsuite-Failure auf den neuen R117-Vertrag angepasst.

## Claude/Simplify

- Claude Code `opusplan` GREEN-Pass erfolgreich.
- `/simplify` wurde nach dem GREEN-Pass ausgeführt.
- `/simplify` machte zunächst nur den neuen R117-Test lesbarer.
- Nach angrenzender Testpflege wurde ein zweiter `/simplify`-Pass ausgeführt.
- Der zweite `/simplify` entfernte Header in zwei Testdateien; Hermes stellte die Header gemäß Projektregel wieder her.
- F1/F2-Token-Tests bleiben bewusst auf Tokens und Regionen fokussiert; der Hero-Vertrag wird durch R117-Test und `App.test.tsx` abgedeckt.

## Review

- Codex Review-only auf aktuellem uncommitted Worktree:
  - Scope: `src/App.tsx`, `src/App.f2_app_shell_tokens.test.tsx`, `src/App.r117_player_hero.test.tsx`.
  - Ergebnis: keine Blocker.
  - Non-Blocker: H1-Matcher sollte exakt mit `^...$` verankert werden.
- Non-Blocker umgesetzt:
  - H1-Matcher in `src/App.r117_player_hero.test.tsx` und `src/App.f2_app_shell_tokens.test.tsx` auf `/^schlangentanz$/i` gehärtet.
- Codex Re-Review:
  - Ergebnis: vorheriger Non-Blocker erledigt.
- Finaler Codex Review-only auf erweitertem R117-Worktree:
  - Scope: `src/App.tsx`, `src/App.test.tsx`, `src/App.f1_design_tokens.test.tsx`, `src/App.f2_app_shell_tokens.test.tsx`, `src/App.r117_player_hero.test.tsx`.
  - Ergebnis: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
  - Bestätigt: R117-Test scoped auf Hero, positive/negative Copy geprüft, F1/F2 nicht blind abgeschwächt, keine Engine-/CSS-Änderung, Zeilenlimit eingehalten.

## Lokale Verifikation

Ausgeführt:

```bash
npm test -- --run src/App.r117_player_hero.test.tsx
npm test -- --run src/App.r117_player_hero.test.tsx src/App.f2_app_shell_tokens.test.tsx
npm test -- --run src/App.test.tsx src/App.f1_design_tokens.test.tsx src/App.f2_app_shell_tokens.test.tsx src/App.r117_player_hero.test.tsx
npm test -- --run
npm run typecheck
npm run lint
npm run check:test-lines
npm run build
git diff --check
```

Ergebnis:

- RED-Failure wie erwartet verifiziert.
- R117/F2-Fokustests grün: 2 Dateien / 2 Tests.
- Angrenzende App-/F1-/F2-/R117-Fokustests grün: 4 Dateien / 29 Tests.
- Full Suite grün: 124 Testdateien / 603 Tests.
- Typecheck grün.
- Lint grün.
- Build grün.
- Testdateilängencheck grün: Alle Testdateien unter 500 Zeilen.
- `git diff --check` grün.
- Dateilängen im Review-Scope:
  - `src/App.tsx`: 486 Zeilen.
  - `src/App.test.tsx`: 488 Zeilen.
  - `src/App.f1_design_tokens.test.tsx`: 39 Zeilen.
  - `src/App.f2_app_shell_tokens.test.tsx`: 41 Zeilen.
  - `src/App.r117_player_hero.test.tsx`: 32 Zeilen.

## Geänderte Dateien

- `src/App.tsx`
- `src/App.test.tsx`
- `src/App.f1_design_tokens.test.tsx`
- `src/App.f2_app_shell_tokens.test.tsx`
- `src/App.r117_player_hero.test.tsx`
- `docs/release_status_2026-06-07_r117.md`

## Release

Feature-/Doku-Commit:

- ausstehend

Push:

- ausstehend

Vercel Production-Deploy:

- ausstehend
- Production-Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Dauerhaft dokumentiert wird bewusst nur der stabile Alias, keine ephemere Deployment-/Inspect-URL.

Production-Smoke:

```bash
npm run smoke:production
```

Ergebnis:

- ausstehend

Finalisierung:

- Dieser Release-Nachweis wird nach Commit, Push, Vercel-Production-Deploy und grünem Production-Smoke finalisiert.

## Nächster kleiner Schritt nach R117

Nach Release von R117 erneut klein bleiben: nächster sinnvoller UI-Slice ist ein schmaler Spieler-facing Copy-/A11y-Abgleich in den noch sichtbaren Debug-/Statusbereichen, ohne Engine- oder Regeländerung. Vor jeder Regel-/Engine-Änderung weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
