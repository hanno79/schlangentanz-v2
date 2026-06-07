# Release-Status R99 — Schlangenhäutung UI-Hinweis

Datum: 07.06.2026
Autor: rahn
Version: R99

## Ziel

Kleiner UI-/Legal-Action-Slice nach R98: Wenn `Schlangenhäutung` fachlich spielbar ist, aber wegen der bewusst vermiedenen Permutations-Enumeration nicht als direkte Engine-Aktion in `ermittleLegaleAktionen` auftaucht, soll die Oberfläche nicht mehr wie „keine Aktion verfügbar“ wirken.

## Source of Truth

Vor dem Release-Gate wurde https://schlangentanz.ch/rules geprüft.

Hinweis: Die Live-Regelseite lieferte am 07.06.2026 per Browser-User-Agent erfolgreich Inhalt, enthielt im abgerufenen HTML aber keine direkt auffindbaren Texttreffer für `Schlangenhäutung` oder `neu anordnen`. R99 ändert deshalb keine neue Regelmechanik, sondern nutzt ausschließlich den bereits in R98 verifizierten Engine-Vertrag:

- `Schlangenhäutung` ist eine eigene Sonderkarte.
- Sie ordnet eine eigene aktive Schlange neu.
- Die Aktion bleibt bewusst nicht vollständig enumeriert, weil alle Permutationen keine sinnvolle UI-Liste ergeben.

## Umsetzung

- Neuer Engine-Helper `ermittleNichtEnumerierteAktionenHinweise` ergänzt.
- Der Helper liefert nur fachliche, UI-neutrale Hinweis-Daten: `{ typ: 'Schlangenhaeutung' }`.
- Die Engine prüft für den Hinweis:
  - Ausspielphase,
  - keine offene Pending-Reaktion,
  - Kartenlimit noch nicht ausgeschöpft,
  - Sonderkartenlimit über die bestehende Schlangenhäutung-Logik,
  - `Schlangenhäutung` auf der Hand,
  - mindestens eine eigene aktive Schlange mit mehr als einer Karte.
- UI mapped den fachlichen Hinweis in `AktionenPanel` auf sichtbaren Text.
- Aktionenbereich zeigt bei diesem Zustand:
  - `Legale Aktionen: 0`,
  - `Nächster Pflichtschritt: Schlangenhäutung vorbereiten.`,
  - Region `Weitere verfügbare Aktionen`,
  - Hinweis `Schlangenhäutung verfügbar`.

## Tests

Neu:

- `src/App.r99_schlangenhaeutung_hinweis.test.tsx`

Erweitert:

- `src/engine/__tests__/legal_actions_enumerator_sonderkarten.test.ts`

Abgedeckt:

- UI zeigt den Schlangenhäutung-Hinweis trotz 0 enumerierter legaler Aktionen.
- Pflichtschritt zeigt nicht mehr irreführend „keine legale Aktion“.
- Engine-Hinweis bleibt fachlich und UI-neutral.
- Kein Hinweis außerhalb der Ausspielphase.
- Kein Hinweis bei offener Reaktion.
- Kein Hinweis bei ausgeschöpftem Kartenlimit.

## Review

Erster unabhängiger Review fand Blocker:

- Hinweis konnte in illegalen Zuständen erscheinen.
- Engine enthielt UI-/Roadmap-Texte.

Fix:

- Allgemeine Ausspiel-Legalitätsbedingungen ergänzt.
- Engine-Hinweis auf fachlichen Typ reduziert.
- UI-Texte ins `AktionenPanel` verschoben.

Zweiter unabhängiger Review: keine Release-Blocker.

## Verifikation

Ausgeführt am 07.06.2026:

```bash
npm test -- --run src/engine/__tests__/legal_actions_enumerator_sonderkarten.test.ts src/App.r99_schlangenhaeutung_hinweis.test.tsx
npm run build
npm test -- --run
npm run check:test-lines
```

Ergebnis:

- Zieltests grün: 19/19 Tests bestanden.
- Build grün.
- Volltest grün: 110 Testdateien, 583 Tests bestanden.
- Test-Dateilängencheck grün.
- `git diff --check` grün.

## Bekannte technische Schuld

- `src/engine/legalActions.ts` liegt als Bestandsdatei weiterhin über 500 Zeilen. R99 hält den Änderungsscope klein und refactort diese zentrale Datei nicht im selben Slice, um keinen großen Nebenschnitt in einen UI-Hinweis-Slice zu ziehen.

## Bewusst nicht im Scope

- Keine Drag-/Sortier-UI für die konkrete Schlangenhäutung-Reihenfolge.
- Keine Permutations-Enumeration in `ermittleLegaleAktionen`.
- Keine neue Regelmechanik gegenüber R98.

## R99 Release abgeschlossen — 2026-06-07

- Commit: `b419cc0 R99: Schlangenhäutung-Hinweis anzeigen`
- Push: `main -> origin/main`
- Production: https://schlangentanz-v2.vercel.app
- Vercel Deployment: https://schlangentanz-v2-imif8doix-alfreds-projects-7e9df1b4.vercel.app
- Live Smoke:
  - `/` HTTP 200
  - `/game` HTTP 200
  - Playwright GUI Smoke auf Production erfolgreich
  - Keine Console Errors
  - Keine Page Errors

## Nächster sinnvoller kleiner Schritt

Ein echter UI-Auswahlslice für `Schlangenhäutung`: aktive eigene Schlange auswählen, neue Reihenfolge sicher erfassen und dann `SchlangenhaeutungSpielen` über den bestehenden Engine-Pfad ausführen.
