# Release Status R67 – 02.06.2026

## Kurzbeschreibung
Die Materialansicht zeigt jetzt zusätzlich die Gesamtzahl aus Nachzieh- und Ablagestapel als eigenen Wert an. Dadurch ist die zusammengefasste Materialmenge direkt sichtbar.

## Verifikation
- `npm test -- --run src/App.r67.test.tsx`
- `npm test -- --run src/App.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r37.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx src/App.r41.test.tsx src/App.r42.test.tsx src/App.r43.test.tsx src/App.r44.test.tsx src/App.r45.test.tsx src/App.r46.test.tsx src/App.r47.test.tsx src/App.r48.test.tsx src/App.r49.test.tsx src/App.r50.test.tsx src/App.r51.test.tsx src/App.r52.test.tsx src/App.r53.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx src/App.r60.test.tsx src/App.r61.test.tsx src/App.r62.test.tsx src/App.r63.test.tsx src/App.r64.test.tsx src/App.r65.test.tsx src/App.r66.test.tsx src/App.r67.test.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Ergebnis
- `Materialstapel gesamt: ... Karten` ist im Bereich `Material und Aufgaben` sichtbar.
- Die getrennten Anzeigen für Nachziehstapel, Ablagestapel und Aufgabenstapel bleiben erhalten.
- Die bestehenden Aufgaben- und Wertungsanzeigen wurden nicht verändert.
