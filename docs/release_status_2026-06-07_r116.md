# R116 Release-Nachweis — Spielerführung Label-IDREF DOM-sicher

Status: lokal fertig, releasebereit — noch nicht committed, nicht gepusht, nicht deployed.
Datum: 2026-06-07

## Ziel

R116 härtet die A11y-Beschriftung der `Spielerführung`-Hauptregion:

- Die Region wird nicht mehr über eine von der sichtbaren Überschrift getrennte `aria-label`-Beschriftung gelabelt.
- Jede `Spielerführung`-Instanz verknüpft die Region per `aria-labelledby` mit ihrer eigenen sichtbaren `<h3>`-Überschrift.
- Zwei gleichzeitig gerenderte Instanzen erzeugen keine doppelten DOM-IDREF-Ziele.
- Bestehende sichtbare Semantik bleibt erhalten: Region `Spielerführung`, Überschrift `Spielerführung`, Mini-Checkliste und Aktionslink-Verhalten.
- Keine Engine-, Regel-, Layout- oder Interaktionsänderung.

## Umgesetzt

- `src/components/Spielerfuehrung.tsx`
  - zweite komponentenlokale React-ID via `useId()` ergänzt.
  - Haupt-`section` von `aria-label="Spielerführung"` auf `aria-labelledby={spielerfuehrungUeberschriftId}` umgestellt.
  - sichtbare `<h3>Spielerführung</h3>` erhält `id={spielerfuehrungUeberschriftId}`.
  - bestehende Checklisten-ID und Aktionslink-Logik unverändert gelassen.
- `src/App.f17_menschlicher_turn_checkliste.test.tsx`
  - neuer Regressionstest rendert zwei `Spielerfuehrung`-Instanzen.
  - prüft genau ein `aria-labelledby`-Token je Region.
  - prüft zwei eindeutige Label-IDREFs.
  - prüft genau ein Ziel im Dokument.
  - prüft, dass das Label-Ziel innerhalb derselben Region liegt.
  - bestehende Checklisten-/Link-Regressionen bleiben erhalten.

## RED/GREEN

- RED:
  - `npm test -- --run src/App.f17_menschlicher_turn_checkliste.test.tsx`
  - Erwarteter Fehlschlag: `expected 1 to be 2`, weil beide Regionen noch kein eigenes `aria-labelledby` hatten und `null` kollabierte.
- GREEN:
  - Claude Code `opusplan` hat den minimalen Fix in `Spielerfuehrung.tsx` umgesetzt.
  - Fokustest danach grün: 1 Datei / 4 Tests.

## Claude/Simplify

- Claude Code `opusplan` GREEN-Pass erfolgreich.
- Claude durfte den Test wegen Permission-Denials nicht selbst ausführen; Hermes hat den fokussierten Test verifiziert.
- `/simplify` wurde als eigener Claude-Code-Pass ausgeführt.
- `/simplify` entfernte zunächst die Dokument-weite Zielzählung im Test; diese Absicherung wurde gemäß DOM-IDREF-Referenz wiederhergestellt, weil `document.querySelectorAll(...).toHaveLength(1)` die Duplicate-ID-Klasse direkt schützt.

## Review

- Codex Review-only auf aktuellem uncommitted Worktree:
  - Scope: `src/components/Spielerfuehrung.tsx`, `src/App.f17_menschlicher_turn_checkliste.test.tsx`.
  - Ergebnis: `BLOCKERS: None`.
  - Non-Blocker: bestätigende Hinweise; keine Änderung erforderlich.
- Codex bestätigte:
  - jede `Spielerführung`-Region nutzt `aria-labelledby`,
  - jedes IDREF ist single-token,
  - jedes Ziel existiert genau einmal,
  - das Ziel ist die sichtbare `h3` innerhalb derselben Region,
  - bestehende Checklisten-/Link-Copy ist unverändert.

## Lokale Verifikation

Ausgeführt:

```bash
npm test -- --run src/App.f17_menschlicher_turn_checkliste.test.tsx
npm test -- --run src/App.f17_menschlicher_turn_checkliste.test.tsx src/App.r112_app_shell_label_idrefs.test.tsx src/App.r113_aktionenpanel_idrefs.test.tsx src/App.r115_zugfortschritt_label_idrefs.test.tsx
npm test -- --run
npm run typecheck
npm run lint
npm run build
npm run check:test-lines
git diff --check
```

Ergebnis:

- R116/F17-Fokustest grün: 1 Datei / 4 Tests.
- Zugehörige IDREF-Regressionen grün: 4 Dateien / 7 Tests.
- Full Suite grün: 123 Testdateien / 602 Tests.
- Typecheck grün.
- Lint grün.
- Build grün.
- Testdateilängencheck grün: Alle Testdateien unter 500 Zeilen.
- `git diff --check` grün.
- Dateilängen:
  - `src/components/Spielerfuehrung.tsx`: 63 Zeilen.
  - `src/App.f17_menschlicher_turn_checkliste.test.tsx`: 103 Zeilen.

## Geänderte Dateien

- `src/components/Spielerfuehrung.tsx`
- `src/App.f17_menschlicher_turn_checkliste.test.tsx`
- `docs/release_status_2026-06-07_r116.md`

## Release-Status

R116 ist lokal fertig und releasebereit.

Noch ausstehend nach expliziter Commit-Freigabe:

1. Feature-/Doku-Commit erstellen.
2. Push auf `origin/main`.
3. Vercel Production-Deploy auf stabilen Alias ausführen.
4. `npm run smoke:production` gegen `https://schlangentanz-v2.vercel.app` ausführen.
5. Release-Nachweis und Dart-Status von `lokal fertig` auf `abgeschlossen und live verifiziert` aktualisieren.

## Nächster kleiner Schritt nach R116

Nach Release von R116: erneut klein bleiben — weiterer DOM-IDREF-/A11y-Audit bei verbleibenden Ziel-/Link-Beziehungen oder ein schmaler regel-/engine-naher Regressionstest. Vor jeder Regel-/Engine-Änderung weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
