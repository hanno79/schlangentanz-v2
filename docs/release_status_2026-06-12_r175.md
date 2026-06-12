# R175 Release-Nachweis — Weitere Aktionen atomar ankündigen

Datum: 12.06.2026  
Repository: `hanno79/schlangentanz-v2`  
Production-Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)

## Ausgangszustand / Resume

- Pflichtdiagnose: Worktree war sauber; nach `git fetch origin main` standen `HEAD` und `origin/main` beide auf `6c69ac9`.
- Keine relevanten projektspezifischen Hängerprozesse gefunden; nur LSP/Code-Server-Prozesse liefen.
- Keine tentative Release-Doku mit offenem Deploy-/Smoke-Status für den aktuellen Stand gefunden.
- Daher wurde der nächste kleinste sichere A11y-Slice gewählt: die bestehende Unterregion `Weitere Aktionen` soll wechselnde Aktionsoptionen höflich und atomar ankündigen.

## Scope

Ziel:

- `Weitere Aktionen` innerhalb `Aktionen` behält das sichtbare lokale `aria-labelledby`-Label und bekommt zusätzlich `aria-live="polite"` plus `aria-atomic="true"`.

Nicht-Ziele:

- Keine Änderung an sichtbarer Copy.
- Keine Änderung an Button-Reihenfolge, Handlern, IDs, Sprungziel-/Fokusverhalten oder benachbarten Unterregionen.
- Keine Engine-/Regeländerung.

## RED → GREEN

RED:

- Neuer Test `src/App.r175_weitere_aktionen_live_region_atomic.test.tsx` fiel zunächst erwartungsgemäß fehl:
  - `Expected the element to have attribute: aria-live="polite"; Received: null`.

GREEN:

- `src/components/AktionenPanel.tsx` ergänzt die bestehende `section` der Unterregion `Weitere Aktionen` um `aria-live="polite"` und `aria-atomic="true"`.
- Der Test prüft:
  - `aria-live="polite"`,
  - `aria-atomic="true"`,
  - kein separates `aria-label`,
  - single-token `aria-labelledby`,
  - dokumentweit genau ein Labelziel,
  - Labelziel innerhalb der Region,
  - sichtbare Überschrift `Weitere Aktionen`,
  - weiterhin vorhandene Regelprüfungs-Copy.

## Claude Code / Simplify

- Claude Code Coding-Pass wurde nach dem vorhandenen `claudeuser`-Pattern versucht, war aber durch `401 Invalid authentication credentials` blockiert.
- Separate Claude-`/simplify`-Vorprüfung war durch denselben Auth-Blocker nicht verfügbar.
- Der Slice war mechanisch klein; daher wurde gemäß Fallback minimal manuell umgesetzt und anschließend objektiv per Fokus-, Regressions- und Full-Gates geprüft.

## Codex Review

Codex Review-only auf dem uncommitted Worktree inklusive untracked R175-Test:

- `BLOCKERS`: Keine.
- `NON-BLOCKERS`: Keine.
- Codex bestätigte:
  - Umsetzung ergänzt nur `aria-live="polite"` und `aria-atomic="true"` an der bestehenden Unterregion,
  - sichtbares Label, fehlendes `aria-label`, Copy/Button-/Handler-Struktur und Fokus-/Sprungzielverhalten bleiben unverändert,
  - der gezielte R175-Test ist grün.

## Verifikation

Fokustests / nahe Regressionen:

```text
npm test -- --run src/App.r175_weitere_aktionen_live_region_atomic.test.tsx src/App.r153_weitere_aktionen_idref.test.tsx src/App.r174_empfohlene_aktion_live_region_atomic.test.tsx src/App.r173_aktionen_live_region_atomic.test.tsx
→ 4 Testdateien / 4 Tests bestanden
```

Full Gates vor Release:

```text
npm test -- --run
→ 181 Testdateien / 669 Tests bestanden

npm run typecheck
→ grün

npm run lint
→ grün

npm run check:test-lines
→ Alle Testdateien bleiben unter 500 Zeilen.

npm run build
→ tsc -b && vite build grün

git diff --check
→ grün
```

Zeilenbudget:

```text
src/components/AktionenPanel.tsx: 280 lines
src/App.r175_weitere_aktionen_live_region_atomic.test.tsx: 40 lines
```

## Commit / Push

Feature-Commit:

- `1053d7b — R175: Weitere Aktionen atomar ankündigen`
- Push auf `origin/main`: erfolgreich.

## Deploy / Smoke

Feature-Deploy:

- `vercel deploy --prod --yes --token=…` → Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bereitgestellt (`READY`).

Production-Smoke gegen den stabilen Alias:

```text
SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production
→ / und /game HTTP 200; Kernregionen Spielstatus, Aktiver Spieler, Aktionen, Schlangenbereich sichtbar; R107 Production-Smoke bestanden.

SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node .tmp_r175_weitere_aktionen_smoke.mjs
→ R175 Live-Smoke bestanden: Weitere Aktionen aria-live=polite, aria-atomic=true, Labelziel="Weitere Aktionen", Alias=https://schlangentanz-v2.vercel.app
```

## Status

R175 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias allgemein sowie slice-spezifisch live gesmoked. Dieser Release-Nachweis vermeidet selbstreferenziellen Doku-Commit-Churn; der finale Cron-Bericht nennt den nach Doku-Sync, erneutem Deploy und erneutem Smoke verifizierten finalen `HEAD`.
