# Release Status R61 – 02.06.2026

## Kurzbeschreibung
Der Zugabschluss zeigt jetzt einen sichtbaren Überhand-Hinweis und bietet einen direkten UI-Pfad zum Abwurf überzähliger Karten, bevor `Zug beenden` wieder verfügbar wird.

## Umsetzung
- Im Bereich **Aktiver Spieler** erscheint bei mehr als 10 Handkarten ein Hinweis auf die Überzahl.
- Im Bereich **Aktionen** ersetzt ein Button `Überzählige Karten abwerfen` den direkten `Zug beenden`-Pfad, solange Überhand besteht.
- Nach dem Abwurf wird der nächste Pflichtschritt wieder auf `Zug beenden` gesetzt.
- Der neue UI-Flow verwendet `werfeUeberzaehligeHandkartenAb(...)` aus der Engine.

## Verifikation
- `npm test -- --run src/App.r61.test.tsx`
- `npm test -- --run src/App.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx src/App.r60.test.tsx src/App.r61.test.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
