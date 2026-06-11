# R154 Release-Nachweis — Phasenaktion per Überschrift labeln

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R154 — die `Phasenaktion`-Unterregion im `Aktionen`-Bereich wird per sichtbarer Überschrift und `aria-labelledby` gelabelt.

## Resume-Befund

Der Cron-Lauf fand keinen halbfertigen Zustand vor:

- `HEAD` und `origin/main` standen nach `git fetch origin main` beide auf `e19b861`.
- Der Worktree war sauber; `git diff --check` hatte keine Befunde.
- Es liefen keine projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse; sichtbare Node-Prozesse waren LSP/code-server-Prozesse.
- R153 war final dokumentiert, deployed und live gesmoked.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R154 begonnen.

## Scope

R154 ist ein enger A11y-/IDREF-Slice:

- Änderung: Die `Phasenaktion`-Unterregion im Bereich `Aktionen` nutzt `aria-labelledby` auf ihre sichtbare Überschrift `Phasenaktion`.
- Erhalten: bestehende Sprungziel-ID `phasenaktionId`, `tabIndex={-1}`, CSS-Klasse `aktionen-gruppe--phasenaktion`, Highlight-/Fokus-Verhalten, Button-Labels, Button-Handler, sichtbare Copy, `Empfohlene Aktion`, `Weitere Aktionen`, Spielerführung/Sprungziele, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, keine neue Interaktion, keine Copy-Umbenennung, kein Layout-Refactor und keine weiteren Regionen.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r154_phasenaktion_idref.test.tsx` wurde zuerst erstellt.
- `npm test -- --run src/App.r154_phasenaktion_idref.test.tsx` schlug erwartungsgemäß fehl, weil `Phasenaktion` noch ein separates `aria-label="Phasenaktion"` trug.

GREEN:

- `src/components/AktionenPanel.tsx` erzeugt ein komponentenlokales `phasenaktionTitelId` via `useId()`.
- Die `Phasenaktion`-Unterregion rendert weiterhin `id={phasenaktionId}` und `tabIndex={-1}`, nutzt jetzt aber `aria-labelledby={phasenaktionTitelId}` und `<h3 id={phasenaktionTitelId}>Phasenaktion</h3>`.
- `src/App.r154_phasenaktion_idref.test.tsx` rendert zwei App-Instanzen und prüft: kein separates `aria-label`, Single-Token-IDREF, documentweit eindeutige Label-IDs, genau ein IDREF-Ziel, Ziel innerhalb der Region, sichtbarer Heading-Text `Phasenaktion`, Heading-Level 3 sowie erhaltene Klasse, ID und `tabIndex`.

## Claude Code / Simplify

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R154 ein enger mechanischer A11y-IDREF-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.
- Eine separate Claude-`/simplify`-Vorprüfung wurde ebenfalls versucht, war wegen desselben Claude-Auth-Blockers aber nicht verfügbar; stattdessen wurden Diff, Zeilenbudget und Tests vor Codex Review manuell geprüft.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R154-Testdatei:

- Initial: `BLOCKERS: Keine`; zwei günstige Testhärtungs-Non-Blocker (zwei App-Instanzen, explizites `h3`-Level) wurden umgesetzt.
- Re-Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- Codex bestätigte den engen IDREF-Vertrag, die erhaltene Sprungziel-ID, `tabIndex`, CSS-/Highlight-Klassen sowie unveränderte Button-Labels und Handler.

## Lokale Gates

Fokustests:

- `npm test -- --run src/App.r154_phasenaktion_idref.test.tsx src/App.r153_weitere_aktionen_idref.test.tsx src/App.f6_aktionenbereich.test.tsx src/App.f18_spielerfuehrung_aktionsbereich_verbindung.test.tsx src/App.f19_sprungziel_hervorhebung.test.tsx src/App.f27_sprungziel_fokus.test.tsx src/App.r113_aktionenpanel_idrefs.test.tsx` → 7 Testdateien / 11 Tests grün.

Full Gates:

- `npm test -- --run` → 160 Testdateien / 648 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-B-3Bvnwl.js` / `dist/assets/index-DOPCpYmG.css`.
- `git diff --check` → grün.
- Zeilenbudget der geänderten Skriptdateien: OK (`src/components/AktionenPanel.tsx` 271 Zeilen; `src/App.r154_phasenaktion_idref.test.tsx` 47 Zeilen).

## Git / GitHub

Feature-Commit:

- `35acb8b R154: Phasenaktion per Überschrift labeln`

Push:

- `main -> origin/main` erfolgreich.

## Production-Deploy

Deploy nach Feature-Commit:

- Vercel Production-Deploy erfolgreich.
- Stable Production Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Deploy-Status: `READY` / Alias gesetzt.
- Ephemere Deployment-URL wird bewusst nicht als dauerhafte Release-Referenz dokumentiert.

## Production-Smoke

Allgemeiner Smoke:

- `npm run smoke:production` gegen [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app).
- `/` und `/game`: HTTP 200.
- Kernregionen sichtbar: `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich`.

R154 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- Slice-spezifisch: Die `Phasenaktion`-Unterregion im Bereich `Aktionen` hat `aria-labelledby` auf genau eine sichtbare `h3` innerhalb der Region, kein separates `aria-label`, behält `id` und `tabIndex=-1` und erzeugt keine Console-/Page-Errors.
- Live-Ergebnis: `R154 Live-Smoke bestanden: Phasenaktion aria-labelledby=_r_h_, kein aria-label, id=_r_1_, tabIndex=-1, Ziel=H3 "Phasenaktion", /game HTTP 200, keine Console-/Page-Errors.`

## Finaler Status

R154 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R154

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
