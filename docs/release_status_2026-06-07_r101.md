# Release-Status R101 — Schlangenhäutung Auswahloption „erste Karte ans Ende"

Datum: 07.06.2026
Autor: rahn
Version: R101

## Ziel

Kleiner Folgeslice nach R100: Der Schlangenhäutung-Hinweis soll neben dem bestehenden Umkehr-Fallback eine zweite konkrete, sichere Auswahloption anbieten.

R101 bleibt bewusst klein: keine freie Sortierung und kein Drag&Drop-Reordering, sondern genau eine weitere Engine-validierte UI-Option: Die erste Karte einer eigenen aktiven Schlange wird ans Ende gesetzt.

## Source of Truth

R101 ändert keine neue Engine-Regelmechanik gegenüber R98/R99/R100. Die aktuelle Regelquelle bleibt https://schlangentanz.ch/rules; der Slice nutzt den bestehenden Engine-Vertrag:

- `Schlangenhäutung` ordnet eine eigene aktive Schlange neu.
- Die neue Reihenfolge muss dieselben Karten enthalten.
- Die Aktion läuft über `pruefeAktion` und `spieleSchlangenhaeutung`.
- UI-Kandidaten dürfen nur angezeigt werden, wenn `pruefeAktion(zustand, aktion).erlaubt` ist.

## Umsetzung

- `src/ui/schlangenhaeutungUiAktionen.ts`
  - Neuer Options-Typ `SchlangenhaeutungUiOption` mit `key`, `ariaLabel`, `label`, `aktion`.
  - Neuer Helper `erstelleSchlangenhaeutungUiOptionen`.
  - Erzeugt pro eigener aktiver Schlange mit mehr als einer Karte:
    - Umkehren.
    - Erste Karte ans Ende.
  - Dedupliziert identische Ergebnis-Reihenfolgen, damit Zwei-Karten-Schlangen nicht zwei gleiche Aktionen anzeigen.
  - Filtert alle Kandidaten über `pruefeAktion`.
  - `erstelleSchlangenhaeutungUmkehrAktionen` bleibt als Kompatibilitätshelper erhalten.
- `src/components/AktionenPanel.tsx`
  - Nutzt jetzt `schlangenhaeutungUiOptionen` statt nur Umkehr-Aktionen.
  - Optionsgruppe heißt semantisch `Schlangenhäutung-Optionen`.
  - Copy wurde aktualisiert: Die Reihenfolge wird nicht mehr in einem „folgenden UI-Slice“ versprochen, sondern als verfügbare Neuordnung im aktuellen Hinweise-Bereich angeboten.
- `src/App.tsx`
  - Verdrahtet die neuen UI-Optionen über `useMemo` in den bestehenden Aktionspfad.

## Tests

Neu:

- `src/App.r101_schlangenhaeutung_erste_karte_ans_ende.test.tsx`

Erweitert:

- `src/ui/schlangenhaeutungUiAktionen.test.ts`
- `src/App.r99_schlangenhaeutung_hinweis.test.tsx`

Abgedeckt:

- UI zeigt `Schlangenhäutung-Optionen` im Bereich `Weitere verfügbare Aktionen`.
- Stale Copy „folgenden UI-Slice“ ist nicht mehr sichtbar.
- Klick auf `erste Karte ans Ende` führt die echte Engine-Aktion `SchlangenhaeutungSpielen` aus.
- Schlangenhäutung-Handkarte landet auf dem Ablagestapel.
- Schlange wird von `rot, blau, grün` zu `blau, grün, rot` neu geordnet.
- Helper erzeugt die neue legale Auswahloption.
- Helper dedupliziert identische Zwei-Karten-Reihenfolgen zwischen Umkehren und „erste Karte ans Ende“.
- R99-Hinweis bleibt erhalten und wurde auf die neue R101-Copy/Optionsgruppe aktualisiert.

## Review

Claude Code:

- GREEN-/`/simplify`-CLI war blockiert: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Stattdessen wurde die Simplify-Prüfung manuell am Diff durchgeführt und durch Gates abgesichert.

Codex Review 1:

- Keine Blocker.
- Nicht-blockierende Findings:
  - Stale Copy mit „folgenden UI-Slice“.
  - Gruppennamen `Schlangenhäutung-Fallbacks` präzisieren.

Fix test-first:

- R101-Test auf neue Copy und `Schlangenhäutung-Optionen` verschärft.
- R99-Test entsprechend aktualisiert.
- `AktionenPanel` Copy und Group-Label korrigiert.

Codex Re-Review:

- Keine Blocker.
- Prior Findings gelöst.
- UI/Engine-Trennung bestätigt: UI erzeugt `SchlangenhaeutungSpielen` und filtert über `pruefeAktion`.

## Verifikation

Ausgeführt am 07.06.2026:

```bash
npm test -- --run src/App.r101_schlangenhaeutung_erste_karte_ans_ende.test.tsx
npm test -- --run src/App.r101_schlangenhaeutung_erste_karte_ans_ende.test.tsx src/App.r100_schlangenhaeutung_umkehren.test.tsx src/App.r99_schlangenhaeutung_hinweis.test.tsx src/ui/schlangenhaeutungUiAktionen.test.ts
npm test -- --run
npm run typecheck
npm run lint
npm run build
npm run check:test-lines
git diff --check
```

Ergebnis:

- RED bestätigt: R101-Button/Optionsgruppe fehlten zuerst.
- Review-Finding-RED bestätigt: alte Group-Copy/Label wurde vom Test gefunden.
- Focused Tests grün: 4 Testdateien, 6 Tests.
- Volltest grün: 113 Testdateien, 588 Tests.
- Typecheck grün.
- Lint grün.
- Production-Build grün.
- Test-Dateilängencheck grün.
- `git diff --check` grün.
- Dateigrößen eingehalten:
  - `src/App.tsx`: 487 Zeilen.
  - `src/components/AktionenPanel.tsx`: 270 Zeilen.
  - `src/ui/schlangenhaeutungUiAktionen.ts`: 72 Zeilen.

## Bewusst nicht im Scope

- Keine frei sortierbare Reihenfolge.
- Kein Drag&Drop-Reordering.
- Keine Permutations-Enumeration in `ermittleLegaleAktionen`.
- Keine neue Engine-Regelmechanik gegenüber R98.

## Nächster sinnvoller kleiner Schritt

Die Schlangenhäutung-Auswahl kann im nächsten Slice von zwei festen Optionen zu einer kleinen, lokalen Kartenreihenfolge-Auswahl ausgebaut werden. Erst danach sollte Drag&Drop-Polish folgen.
