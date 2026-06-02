# Release Status R63 – 02.06.2026

## Kurzbeschreibung
Der Spielstatus zeigt jetzt eine sichtbare Endspurt-Kennzeichnung, sobald die Partie in der Endrunde ist. Damit ist der Übergang nach dem leeren Nachziehstapel klarer nachvollziehbar.

## Verifikation
- `npm test -- --run src/App.r63.test.tsx`
- `npm test -- --run src/App.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx src/App.r60.test.tsx src/App.r61.test.tsx src/App.r62.test.tsx src/App.r63.test.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Ergebnis
- Die Endrunde wird mit `Endrunde aktiv: ja` sichtbar markiert.
- Auslöser und verbleibende Endrunden-Spieler sind im Spielstatus klar lesbar.
- Die bestehende UI bleibt unverändert grün, die neue Anzeige fügt nur Kontext hinzu.
