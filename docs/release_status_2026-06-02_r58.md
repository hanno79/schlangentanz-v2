# Release-Status R58 — Live-Region für den aktiven Spieler

Datum: 02.06.2026

## Ziel
Der aktive Spielerbereich soll als polite Live-Region markiert sein, damit sich Statusänderungen für Assistive-Technologien besser ankündigen.

## Umsetzung
- `src/App.tsx` setzt am Bereich `Aktiver Spieler` jetzt `aria-live="polite"`.
- Neuer UI-Test prüft die Live-Region direkt.

## Verifikation
- `npm test -- --run src/App.r58.test.tsx` ✅
- `npm test -- --run src/App.test.tsx src/App.r54.test.tsx src/App.r55.test.tsx src/App.r56.test.tsx src/App.r57.test.tsx src/App.r58.test.tsx` ✅
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅

## Nächster Schritt
- Produktions-Deploy und Live-Smoke gegen den Alias.
