# Release-Status 2026-06-02 — R56

## Ziel
Die Spielende-Ansicht soll den Endstand klar anzeigen und die Gewinnerübersicht sichtbar machen.

## Umgesetzt
- Im Bereich **Aktiver Spieler** erscheint im Spielende-Zustand der Hinweis `Spielende erreicht.`
- Die Gewinner werden als `Gewinner: ...` angezeigt.
- Die Aktionsbuttons werden im Spielende-Zustand unterdrückt.
- Neuer UI-Test: `src/App.r56.test.tsx`

## Verifikation
- `npm test -- --run src/App.r56.test.tsx` ✅
- `npm test -- --run src/App.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx` ✅
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅

## Nächster Schritt
Deploy + Live-Smoke, dann GitHub main und Gate-Dokumentation abschließen.
