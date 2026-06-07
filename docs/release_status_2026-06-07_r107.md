# Release-Status R107 — Robuster Production-Smoke-Skriptpfad

Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: Lokaler Release-Nachweis für R107 — reproduzierbarer Production-Smoke über npm-Skript, HTTP-Checks und exakte Browser-Regionen.

# ÄNDERUNG 07.06.2026: R107 dokumentiert einen kleinen Tooling-/Smoke-Slice für Schlangentanz.

## Ziel

R107 macht den Live-Smoke reproduzierbar und robuster:

- Ein eindeutiger npm-Skriptpfad `npm run smoke:production` führt den Production-Smoke aus.
- Der Smoke prüft `/` und `/game` per HTTP 200.
- Der Browser-Smoke prüft `/game` gegen exakt benannte Regionen.
- Console-Errors und Page-Errors führen zum Fehlschlag.
- Ein schneller Offline-Selbsttest dokumentiert die exakte Smoke-Konfiguration ohne Netzwerk/Browser.

## Umgesetzt

- Neues Skript `scripts/live_smoke.mjs`:
  - Default-Ziel: `https://schlangentanz-v2.vercel.app`.
  - Optionales Ziel über `SMOKE_BASE_URL`.
  - URL-Normalisierung über `new URL(route, BASE_URL).toString()`.
  - HTTP-Timeouts über `AbortSignal.timeout(HTTP_TIMEOUT_MS)`.
  - Exakte Browser-Regionen per `getByRole('region', { name: text, exact: true })`.
  - Import-sicherer CLI-Guard, damit Tests das Modul importieren können, ohne den Live-Smoke auszuführen.
- Neues npm-Skript in `package.json`:
  - `smoke:production`: `node scripts/live_smoke.mjs`
- Neuer Test `tests/r107_live_smoke_script.test.ts`:
  - prüft den npm-Skriptpfad,
  - prüft die exakte Selbsttest-Ausgabe,
  - sichert URL-Normalisierung, HTTP-Timeouts und exakte Browser-Regionen gegen Regressionen ab.

## Relevante Dateien

- `package.json`
- `scripts/live_smoke.mjs`
- `tests/r107_live_smoke_script.test.ts`
- `docs/release_status_2026-06-07_r107.md`

## Tests und Gates

Ausgeführt lokal vor Commit-Freigabe:

```bash
npm test -- --run tests/r107_live_smoke_script.test.ts
node scripts/live_smoke.mjs --self-test
node -e "import('./scripts/live_smoke.mjs').then(m=>console.log(m.erstelleSelbsttestAusgabe()))"
SMOKE_BASE_URL='https://schlangentanz-v2.vercel.app/' npm run smoke:production
npm test -- --run
npm run typecheck
npm run lint
npm run check:test-lines
npm run build
npm run smoke:production
git diff --check
```

Ergebnis:

- Focused R107-Test grün: 1 Testdatei, 3 Tests.
- CLI-Selbsttest grün.
- Import-Selbsttest grün; Import löst keinen Smoke aus.
- Production-Smoke grün:
  - `/` HTTP 200
  - `/game` HTTP 200
  - Region sichtbar: `Spielstatus`
  - Region sichtbar: `Aktiver Spieler`
  - Region sichtbar: `Aktionen`
  - Region sichtbar: `Schlangenbereich`
  - Keine Console Errors
  - Keine Page Errors
- Full Tests grün: 116 Testdateien, 592 Tests.
- Typecheck grün.
- Lint grün.
- Test-Dateilängencheck grün.
- Build grün.
- `git diff --check` grün.

## Review

- Claude Code GREEN-Pass mit Modell `opusplan`: initialer Smoke-Skriptpfad ergänzt.
- Claude Code `/simplify`: durchgeführt; spätere dritte Simplify-Session hing in einem Vitest-Lauf und wurde beendet, ohne relevante Worktree-Änderungen zu hinterlassen.
- Codex Review nach erstem GREEN:
  - BLOCKER: Selbsttest war nicht exakt genug.
  - BLOCKER: Browser-Textprüfung nutzte substring-artige Suche.
  - BLOCKER: HTTP-Checks hatten keinen Timeout.
- Umgesetzte Review-Fixes:
  - exakte Pflichtlisten `PFLICHT_ROUTEN` und `PFLICHT_KERN_TEXTE`,
  - exakte Region-Selektoren,
  - HTTP-Timeouts,
  - URL-Normalisierung,
  - Import-sicherer Selbsttest ohne Child-Process-Spawn.
- Codex Re-Review nach Härtung:
  - BLOCKERS: none
  - Bestätigt: exakte Selbsttest-Route/Text-Sets.
  - Bestätigt: exakte Browser-Regionen.
  - Bestätigt: HTTP-Timeouts und URL-Normalisierung.
  - Bestätigt: kein Vitest-Child-Process-EPERM-Risiko mehr.
  - Bestätigt: Typecheck-kompatibel.

## Bewusst nicht im Scope

- Keine Engine-Änderung.
- Keine UI-Änderung.
- Kein Deploy-Workflow-Umbau.
- Keine neue Playwright-Konfigurationsdatei.
- Kein Commit, Push oder Deploy ohne explizite Freigabe.

## Lokaler Status — releasebereit, noch nicht committed

- Status: lokal fertig und releasebereit.
- Commit: noch offen; Projektregel verlangt explizite Freigabe vor Commit.
- Push: noch offen.
- Deploy: noch offen.
- Finaler Release-Smoke nach Deploy: noch offen.

Vorgeschlagene Commit-Nachricht nach Freigabe:

```text
R107: Production-Smoke-Skript robust machen
```
