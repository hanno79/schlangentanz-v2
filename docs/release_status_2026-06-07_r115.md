# R115 Release-Nachweis — Zugfortschritt Label-IDREFs DOM-sicher

Status: lokal fertig, releasebereit. Commit/Push/Deploy/Smoke stehen wegen Projektregel noch aus.
Datum: 2026-06-07

## Ziel

R115 härtet die A11y-Beschriftung des `Zugfortschritt`-Bereichs:

- Die Region wird nicht mehr über eine statische `aria-label`-Beschriftung gelabelt.
- Jede Instanz verknüpft die Region per `aria-labelledby` mit ihrer eigenen komponentenlokalen Überschrift.
- Zwei gleichzeitig gerenderte Instanzen erzeugen keine doppelten DOM-IDREF-Ziele.
- Bestehende sichtbare Semantik bleibt erhalten: `role="region"` mit Name `Zugfortschritt`, Überschrift `Zugfortschritt`, aktive Phase mit `aria-current="step"`.
- Keine Engine-, Regel-, Layout- oder Interaktionsänderung.

## Umgesetzt

- `src/components/Zugfortschritt.tsx`
  - `useId()` ergänzt.
  - Region von `aria-label="Zugfortschritt"` auf `aria-labelledby={titelId}` umgestellt.
  - Überschrift erhält `id={titelId}`.
- `src/App.r115_zugfortschritt_label_idrefs.test.tsx`
  - Neuer Regressionstest rendert zwei `Zugfortschritt`-Instanzen.
  - Prüft genau ein `aria-labelledby`-Token je Region.
  - Prüft eindeutiges Ziel im Dokument.
  - Prüft, dass das Ziel innerhalb derselben Region liegt.
  - Prüft weiterhin zugänglichen Regionsnamen und sichtbare Überschrift.

## RED/GREEN

- RED:
  - `npm test -- --run src/App.r115_zugfortschritt_label_idrefs.test.tsx`
  - Erwarteter Fehlschlag: `expected null to be truthy`, weil `aria-labelledby` noch fehlte.
- GREEN:
  - Minimaler Fix in `Zugfortschritt.tsx`.
  - R115-Test grün.
  - F9/F10/F11-Zugfortschritt-/Debug-Regressionen grün.

## Claude/Simplify

- Claude Code `opusplan` war weiterhin blockiert:
  - Smoke: `claude --model opusplan -p 'Antworte exakt nur mit OK.' --max-turns 1 --output-format json`
  - Ergebnis: `401 Invalid authentication credentials`.
- Deshalb manueller Fallback gemäß Workflow:
  - Diff manuell auf Minimalität geprüft.
  - Keine Verhaltensänderung außerhalb Label-IDREF.
  - Dateilängen geprüft.

## Review

- Codex Review-only auf aktuellem uncommitted Worktree inklusive untracked R115-Test:
  - `BLOCKERS: keine`.
  - Non-Blocker: Test sollte zusätzlich prüfen, dass das Label-Ziel innerhalb derselben Region liegt.
- Non-Blocker umgesetzt.
- Codex Re-Check:
  - `BLOCKERS: Keine`.
  - `NON-BLOCKERS: Keine`.

## Verifikation

Ausgeführt:

```bash
npm test -- --run src/App.r115_zugfortschritt_label_idrefs.test.tsx
npm test -- --run src/App.f9_zugfortschritt.test.tsx src/App.f10_debuggruppen.test.tsx src/App.f11_debuggruppen_polish.test.tsx
npm test -- --run src/App.r115_zugfortschritt_label_idrefs.test.tsx src/App.f9_zugfortschritt.test.tsx
npm run check:test-lines
npm run typecheck
npm run lint
npm run build
npm test -- --run
git diff --check
```

Ergebnis:

- R115-Fokustest grün: 1 Datei / 1 Test.
- Zugehörige Regressionen grün:
  - F9/F10/F11: 3 Dateien / 7 Tests.
  - R115 + F9 nach Review-Härtung: 2 Dateien / 6 Tests.
- Testdateilängencheck grün: Alle Testdateien unter 500 Zeilen.
- Typecheck grün.
- Lint grün.
- Build grün.
- Full Suite grün: 123 Testdateien / 601 Tests.
- `git diff --check` grün.
- Dateilängen:
  - `src/components/Zugfortschritt.tsx`: 51 Zeilen.
  - `src/App.r115_zugfortschritt_label_idrefs.test.tsx`: 40 Zeilen.

## Geänderte Dateien

- `src/components/Zugfortschritt.tsx`
- `src/App.r115_zugfortschritt_label_idrefs.test.tsx`
- `docs/release_status_2026-06-07_r115.md`

## Noch offen für Release

Wegen Projektregel „Nur auf explizite Anweisung committen / vor jedem Commit nachfragen“ wurde noch nicht committed.

Nächste Release-Kette nach Freigabe:

1. Commit: vorgeschlagene Nachricht `R115: Zugfortschritt per Label-IDREF beschreiben`
2. Push nach `origin/main`
3. Vercel Production Deploy auf [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
4. `npm run smoke:production`
5. Optionaler First-Turn-/A11y-Smoke, falls nach Deploy gewünscht
6. Diese Doku von `lokal fertig, releasebereit` auf `abgeschlossen und live verifiziert` aktualisieren

## Nächster kleiner Schritt nach R115

Nach Release von R115: entweder weiterer DOM-IDREF-Audit bei kleineren Status-/Debug-Komponenten oder ein kleiner regel-/engine-naher Regressionstest. Vor jeder Regel-/Engine-Änderung weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
