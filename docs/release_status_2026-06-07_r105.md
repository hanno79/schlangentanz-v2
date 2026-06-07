# Release-Status R105 — Schlangenhäutung-Reihenfolge-Vorschau

Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R105 — Vorschau der aktuellen und neuen Reihenfolge in der bestehenden Schlangenhäutung-Reihenfolge-Auswahl.

# ÄNDERUNG 07.06.2026: R105 dokumentiert den UX-Polish-Slice für die bestehende Schlangenhäutung-Auswahl.

## Ziel

R105 macht die bestehende `Schlangenhäutung-Reihenfolge-Auswahl` verständlicher:

- Die aktuelle Reihenfolge der betroffenen Schlange ist sichtbar.
- Die neue Reihenfolge nach „gewählte Karte ans Ende“ ist sichtbar.
- Die neue Reihenfolge nach „Schlange umkehren“ ist sichtbar.
- Beide bestehenden Aktionen bleiben in derselben Auswahlgruppe.
- Die UI macht klar, dass die Regelprüfung beim Ausführen weiterhin in der Engine bleibt.

## Umgesetzt

- `SchlangenhaeutungReihenfolgeAuswahl` zeigt pro betroffener Schlange eine Vorschau:
  - `Aktuelle Reihenfolge: ...`
  - `Neue Reihenfolge nach Karte ans Ende: ...`
  - `Neue Reihenfolge nach Umkehr: ...`
- Kurze Hilfetexte erklären die zwei vorhandenen Aktionen.
- Die bestehenden Buttons und der bestehende Engine-Pfad über `pruefeAktion` und `onAktionAusfuehren` bleiben unverändert.
- Die frühere separate Gruppe `Schlangenhäutung-Optionen` bleibt entfernt.
- Neuer R105-Test sichert Initial-Vorschau, dynamische Select-Aktualisierung und Anti-Doppelungs-Anforderung ab.

## Relevante Dateien

- `src/components/SchlangenhaeutungReihenfolgeAuswahl.tsx`
- `src/App.r105_schlangenhaeutung_reihenfolge_vorschau.test.tsx`

## Tests und Gates

Ausgeführt vor Release:

```bash
npm test -- --run src/App.r105_schlangenhaeutung_reihenfolge_vorschau.test.tsx
npm test -- --run src/App.r105_schlangenhaeutung_reihenfolge_vorschau.test.tsx src/App.r104_schlangenhaeutung_umkehr_in_auswahl.test.tsx src/App.r102_schlangenhaeutung_reihenfolge_auswahl.test.tsx
npm test -- --run src/App.r105_schlangenhaeutung_reihenfolge_vorschau.test.tsx src/App.r104_schlangenhaeutung_umkehr_in_auswahl.test.tsx src/App.r102_schlangenhaeutung_reihenfolge_auswahl.test.tsx src/App.r103_schlangenhaeutung_redundanz_reduzieren.test.tsx src/App.r100_schlangenhaeutung_umkehren.test.tsx src/App.r99_schlangenhaeutung_hinweis.test.tsx
npm run typecheck
npm run lint
npm test -- --run
npm run build
npm run check:test-lines
git diff --check
```

Ergebnis:

- RED bestätigt: R105-Test scheiterte zuerst wegen fehlender Vorschau-Texte.
- Focused Tests grün: R99/R100/R102/R103/R104/R105.
- Typecheck grün.
- Lint grün.
- Full Tests grün: 115 Testdateien, 588 Tests.
- Build grün.
- Test-Dateilängencheck grün.
- `git diff --check` grün.

## Review

- Claude Code GREEN-Pass mit Modell `opusplan` umgesetzt.
- Claude Code `/simplify` ausgeführt; kleine JSX-Vereinfachung ohne Verhaltensänderung.
- Codex Review auf uncommitted Worktree inklusive untracked R105-Test:
  - BLOCKERS: none
  - NON-BLOCKERS: none

## Bewusst nicht im Scope

- Keine freie Vollsortierung.
- Kein Drag&Drop-Reordering.
- Keine Engine-Regeländerung.
- Keine Permutations-Enumeration in `ermittleLegaleAktionen`.
- Keine neue Parallelkomponente.

## Release abgeschlossen — 2026-06-07

- Commit Feature: `c515194 R105: Schlangenhäutung-Vorschau anzeigen`
- Push: `main -> origin/main`
- Production: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Production-Alias-Deploy nach Feature-Commit: READY
- Production Smoke:
  - `/` HTTP 200
  - `/game` HTTP 200
  - Bundle enthält `Schlangenhäutung-Reihenfolge-Auswahl`
  - Bundle enthält `Aktuelle Reihenfolge:`
  - Bundle enthält `Neue Reihenfolge nach Karte ans Ende:`
  - Bundle enthält `Neue Reihenfolge nach Umkehr:`
  - Bundle enthält `Die Regelprüfung bleibt beim Ausführen in der Engine.`
  - Bundle enthält nicht mehr `Schlangenhäutung-Optionen`
  - Playwright GUI-Smoke erfolgreich
  - Geprüfte Regionen: `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich`
  - Keine Console Errors
  - Keine Page Errors

## Geplante Folgeslices

- R106: Regeltest für neue Dreiergruppen-Zählung.
- R107: Live-Smoke robuster machen.
- R108: Schlangenhäutung-Auswahl Tastatur-/A11y-Polish.
