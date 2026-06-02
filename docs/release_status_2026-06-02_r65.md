# Release Status R65 – 02.06.2026

## Kurzbeschreibung
Im Endspurt zeigt die UI offene Aufgabenkarten mit verdoppelten Punkten und einer klaren ×2-Anzeige an. Die normale Anzeige außerhalb des Endspurts bleibt unverändert.

## Verifikation
- `npm test -- --run src/App.r65.test.tsx`
- `npm test -- --run src/App.test.tsx src/App.r49.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx src/App.r60.test.tsx src/App.r61.test.tsx src/App.r62.test.tsx src/App.r63.test.tsx src/App.r64.test.tsx src/App.r65.test.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Ergebnis
- Offene Aufgaben werden im Endspurt mit `×2` und dem verdoppelten Punktwert angezeigt.
- Die Bedingung der Aufgabe bleibt sichtbar.
- Die Anzeige für geheime Aufgaben bleibt unverändert.
