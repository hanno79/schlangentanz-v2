# Release Status R66 – 02.06.2026

## Kurzbeschreibung
Die Wertungsansicht zeigt jetzt pro Spieler zusätzlich die Aufteilung in Farbgruppen- und Aufgabenpunkte. Die Gesamtwertung bleibt unverändert sichtbar.

## Verifikation
- `npm test -- --run src/App.r66.test.tsx`
- `npm test -- --run src/App.test.tsx src/App.r49.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx src/App.r60.test.tsx src/App.r61.test.tsx src/App.r62.test.tsx src/App.r63.test.tsx src/App.r64.test.tsx src/App.r65.test.tsx src/App.r66.test.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Ergebnis
- Pro Spieler wird `Wertung ...` weiterhin angezeigt.
- Zusätzlich wird `Wertungsdetails ...` mit Farbgruppen- und Aufgabenpunkten angezeigt.
- Der Normalzustand bleibt unverändert; die bisherigen UI-Hinweise bleiben weiterhin sichtbar.
