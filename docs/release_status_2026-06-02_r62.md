# Release Status R62 – 02.06.2026

## Kurzbeschreibung
Die UI zeigt jetzt einen kompakten Block mit Phasenregeln im Aktionsbereich. Er bleibt auch im Spielende sichtbar und erklärt den aktuellen Zugkontext ohne zusätzliche Interaktion.

## Verifikation
- `npm test -- --run src/App.r60.test.tsx src/App.r61.test.tsx src/App.r62.test.tsx`
- `npm test -- --run src/App.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx src/App.r60.test.tsx src/App.r61.test.tsx src/App.r62.test.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Ergebnis
- Phasenregeln werden im UI angezeigt und sind nicht mehr nur implizit über Buttons erkennbar.
- Die Regeltexte nutzen jetzt `MINDESTHANDKARTEN` und `MAX_KARTEN_PRO_ZUG` aus der Engine statt harter Zahlen im Klartext.
- Die R60- und R61-Tests wurden gegen die aktualisierte Button-/Regeltext-Situation stabilisiert.
