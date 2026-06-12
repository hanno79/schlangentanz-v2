# R173 Release-Nachweis — Aktionen atomar ankündigen

Datum: 12.06.2026  
Repository: `hanno79/schlangentanz-v2`  
Production-Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)

## Ausgangszustand / Resume

- Pflichtdiagnose: Worktree war sauber, `HEAD` und `origin/main` standen beide auf `b59d33c`.
- Keine relevanten projektbezogenen Hängerprozesse gefunden; nur LSP/Code-Server-Prozesse liefen.
- Keine tentative Release-Doku mit offenem Deploy-/Smoke-Status für den aktuellen Stand gefunden.
- Daher wurde der nächste kleinste sichere A11y-Slice gewählt: die bereits sichtbare und per Überschrift gelabelte Top-Level-Region `Aktionen` soll Änderungen an spielbaren Optionen höflich und atomar ankündigen.

## Scope

Ziel:

- `Aktionen` innerhalb `Aktiver Spieler` behält das sichtbare lokale `aria-labelledby`-Label und bekommt zusätzlich `aria-live="polite"` plus `aria-atomic="true"`.

Nicht-Ziele:

- Keine Änderung an sichtbarer Copy.
- Keine Änderung an Button-Reihenfolge, Handlern, Sprungziel-/Fokusverhalten oder Unterregionen wie `Empfohlene Aktion`, `Weitere Aktionen`, `Phasenaktion` und `Phasenregeln`.
- Keine Engine-/Regeländerung.

## RED → GREEN

RED:

- Neuer Test `src/App.r173_aktionen_live_region_atomic.test.tsx` fiel zunächst erwartungsgemäß fehl:
  - `Expected the element to have attribute: aria-live="polite"; Received: null`.

GREEN:

- `src/components/AktionenPanel.tsx` ergänzt die bestehende Top-Level-`section` der Region `Aktionen` um `aria-live="polite"` und `aria-atomic="true"`.
- Der Test prüft:
  - `aria-live="polite"`,
  - `aria-atomic="true"`,
  - kein separates `aria-label`,
  - single-token `aria-labelledby`,
  - dokumentweit genau ein Labelziel,
  - Labelziel innerhalb der Region,
  - sichtbare Überschrift `Aktionen`,
  - erhaltene Unterregionen `Empfohlene Aktion` und `Weitere Aktionen`.

## Claude Code / Simplify

- Claude Code Coding-Pass wurde nach dem vorhandenen `claudeuser`-Pattern versucht, war aber durch `401 Invalid authentication credentials` blockiert.
- Separate Claude-`/simplify`-Vorprüfung war durch denselben Auth-Blocker nicht verfügbar.
- Der Slice war mechanisch klein; daher wurde gemäß Fallback minimal manuell umgesetzt und anschließend objektiv per Fokus-, Regressions- und Full-Gates geprüft.

## Codex Review

Codex Review-only auf dem uncommitted Worktree inklusive untracked R173-Test:

- `BLOCKERS`: Keine.
- Ein günstiger Non-Blocker wurde behoben: Header-Version in `AktionenPanel.tsx` auf `1.12` synchronisiert.
- Codex bestätigte außerdem:
  - Umsetzung ändert nur die bestehende Top-Level-Region `Aktionen` um Live-/Atomic-Attribute,
  - sichtbares Label, Handler, Unterregionen, IDs und Fokus-/Sprungzielattribute bleiben unverändert,
  - der Test sichert dokumentweite Label-Eindeutigkeit und lokales Ziel-Containment ab.

## Verifikation

Fokustests / nahe Regressionen:

```text
npm test -- --run src/App.r173_aktionen_live_region_atomic.test.tsx src/App.r153_weitere_aktionen_idref.test.tsx src/App.f19_sprungziel_hervorhebung.test.tsx src/App.f27_sprungziel_fokus.test.tsx src/App.r172_spieltisch_live_region_atomic.test.tsx
→ 5 Testdateien / 7 Tests bestanden
```

Full Gates vor Release:

```text
npm test -- --run
→ 179 Testdateien / 667 Tests bestanden

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
src/App.tsx: 500 lines
src/components/AktionenPanel.tsx: 278 lines
src/App.r173_aktionen_live_region_atomic.test.tsx: 42 lines
```

## Commit / Push

Feature-Commit:

- `82783d1 — R173: Aktionen atomar ankündigen`
- Push auf `origin/main`: erfolgreich.

## Deploy / Smoke

Feature-Deploy:

- `vercel deploy --prod --yes --token=…` → Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bereitgestellt (`READY`).

Production-Smoke gegen den stabilen Alias:

```text
SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production
→ / und /game HTTP 200; Kernregionen Spielstatus, Aktiver Spieler, Aktionen, Schlangenbereich sichtbar; R107 Production-Smoke bestanden.

SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node .tmp_r173_aktionen_smoke.mjs
→ R173 Live-Smoke bestanden: Aktionen aria-live=polite, aria-atomic=true, Labelziel="Aktionen", Alias=https://schlangentanz-v2.vercel.app
```

## Status

R173 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias allgemein sowie slice-spezifisch live gesmoked. Dieser Release-Nachweis vermeidet selbstreferenziellen Doku-Commit-Churn; der finale Cron-Bericht nennt den nach Doku-Sync, erneutem Deploy und erneutem Smoke verifizierten finalen `HEAD`.
