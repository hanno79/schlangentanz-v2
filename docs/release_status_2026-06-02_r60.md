# Release Status R60 – 02.06.2026

## Kurzbeschreibung
Das UI zeigt nach ausgeführten Aktionen jetzt ein unmittelbares Feedback im Bereich **Aktiver Spieler** an.

## Umsetzung
- Neuer Hinweis `Zuletzt ausgeführt: ...` im aktiven Spielerbereich.
- Die sichtbaren Aktionsbuttons aktualisieren den Feedback-Text direkt nach Klick.
- Auch die phasenbezogenen Steuerbuttons setzen jetzt dieses Feedback.

## Verifikation
- `npm test -- --run src/App.r60.test.tsx`
- `npm test -- --run src/App.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx src/App.r59.test.tsx src/App.r60.test.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
