# Release-Status R104 — Schlangenhäutung-Umkehr in Reihenfolge-Auswahl

Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R104 — Integration der Umkehr-Aktion in die bestehende Schlangenhäutung-Reihenfolge-Auswahl und Entfernung der separaten Quick-Option-Gruppe.

# ÄNDERUNG 07.06.2026: R104 dokumentiert den Abschluss des Anti-Doppelungs-Slices für die Schlangenhäutung-UI.

## Ziel

R104 reduziert die letzte UI-Doppelung rund um Schlangenhäutung:

- Die Umkehr-Aktion bleibt ausführbar.
- Die Umkehr-Aktion wird in der bestehenden `Schlangenhäutung-Reihenfolge-Auswahl` angeboten.
- Die separate Gruppe `Schlangenhäutung-Optionen` entfällt.
- Keine Engine-Regeländerung.
- Kein neuer Drag&Drop-Pfad.
- Keine Parallelmechanik.

## Umgesetzt

- `SchlangenhaeutungReihenfolgeAuswahl` baut jetzt neben der lokalen „gewählte Karte ans Ende“-Aktion auch die sichere Umkehr-Aktion.
- Gemeinsamer privater Aktionskontext-Helper vermeidet doppelte Suche nach aktivem Spieler, Schlangenhäutung-Handkarte und Zielschlange.
- `AktionenPanel` rendert keine separate `Schlangenhäutung-Optionen`-Gruppe mehr.
- `App.tsx` berechnet und übergibt keine separaten `schlangenhaeutungUiOptionen` mehr.
- Der alte Helper-Pfad `src/ui/schlangenhaeutungUiAktionen.ts` inklusive Helper-Test wurde entfernt.
- R99-Test wurde auf die neue Zielstruktur angepasst.
- Neuer R104-Test sichert ab, dass die Umkehr-Aktion in der Reihenfolge-Auswahl ausführbar ist und die separate Optionsgruppe nicht mehr gerendert wird.

## Relevante Dateien

- `src/components/SchlangenhaeutungReihenfolgeAuswahl.tsx`
- `src/components/AktionenPanel.tsx`
- `src/App.tsx`
- `src/App.r99_schlangenhaeutung_hinweis.test.tsx`
- `src/App.r104_schlangenhaeutung_umkehr_in_auswahl.test.tsx`
- Entfernt: `src/ui/schlangenhaeutungUiAktionen.ts`
- Entfernt: `src/ui/schlangenhaeutungUiAktionen.test.ts`

## Tests und Gates

Ausgeführt vor Release:

```bash
npm test -- --run src/App.r104_schlangenhaeutung_umkehr_in_auswahl.test.tsx src/App.r103_schlangenhaeutung_redundanz_reduzieren.test.tsx src/App.r102_schlangenhaeutung_reihenfolge_auswahl.test.tsx src/App.r100_schlangenhaeutung_umkehren.test.tsx src/App.r99_schlangenhaeutung_hinweis.test.tsx
npm run typecheck
npm run lint
npm test -- --run
npm run build
npm run check:test-lines
git diff --check
```

Ergebnis:

- RED bestätigt: R104-Test scheiterte zuerst wegen vorhandener separater Gruppe `Schlangenhäutung-Optionen`.
- Focused Tests grün: R99/R100/R102/R103/R104.
- Typecheck grün.
- Lint grün.
- Full Tests grün: 114 Testdateien, 587 Tests.
- Build grün.
- Test-Dateilängencheck grün.
- `git diff --check` grün.

## Review

- Claude Code GREEN-Pass lief bis max-turns; Änderungen wurden danach direkt inspiziert und verifiziert.
- Claude Code `/simplify` erfolgreich; gemeinsamer privater Aktionskontext-Helper ergänzt und redundanter Array-Spread entfernt.
- Codex Review auf uncommitted Worktree inklusive untracked/deleted Files:
  - BLOCKERS: none
  - NON-BLOCKERS: none

## Bewusst nicht im Scope

- Keine freie Vollsortierung.
- Kein Drag&Drop-Reordering.
- Keine neue Engine-Regelmechanik gegenüber R98.
- Keine neue Sonderkarten-Architektur.
- Keine Permutations-Enumeration in `ermittleLegaleAktionen`.

## Release abgeschlossen — 2026-06-07

- Commit Feature: `fccdfce R104: Schlangenhäutung-Umkehr integrieren`
- Push: `main -> origin/main`
- Production: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Vercel Deployment: [https://schlangentanz-v2-fas0tr8b1-alfreds-projects-7e9df1b4.vercel.app](https://schlangentanz-v2-fas0tr8b1-alfreds-projects-7e9df1b4.vercel.app)
- Production Smoke:
  - `/` HTTP 200
  - `/game` HTTP 200
  - Bundle enthält `Schlangenhäutung-Reihenfolge-Auswahl`
  - Bundle enthält `gewählte Karte aus Schlange`
  - Bundle enthält `Schlange umkehren`
  - Bundle enthält nicht mehr `Schlangenhäutung-Optionen`
  - Playwright GUI-Smoke erfolgreich
  - Geprüfte Regionen: `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich`
  - Keine Console Errors
  - Keine Page Errors
