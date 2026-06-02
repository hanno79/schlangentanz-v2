# Release Status R64 – 02.06.2026

## Kurzbeschreibung
Der Phasenregeln-Bereich zeigt jetzt zusätzlich eine sichtbare Liste der aktuellen legalen Aktionen. Im leeren Zustand bleibt die Anzeige klar und verständlich.

## Verifikation
- `npm test -- --run src/App.r64.test.tsx`
- `npm test -- --run src/App.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx src/App.r60.test.tsx src/App.r61.test.tsx src/App.r62.test.tsx src/App.r63.test.tsx src/App.r64.test.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Ergebnis
- Der Phasenregeln-Bereich listet die aktuellen legalen Aktionen separat auf.
- Im leeren Zustand erscheint `Aktuell keine legalen Aktionen in dieser Phase.` sichtbar in diesem Bereich.
- Die vorhandenen Spielstatus- und Endrundenanzeigen bleiben bestehen.
